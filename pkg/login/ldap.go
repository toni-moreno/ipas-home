package login

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io/ioutil"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/toni-moreno/ipas-home/pkg/config"
	"gopkg.in/ldap.v3"
)

type ILdapConn interface {
	Bind(username, password string) error
	Search(*ldap.SearchRequest) (*ldap.SearchResult, error)
	StartTLS(*tls.Config) error
	Close()
}

type ILdapAuther interface {
	Login(ctx *Context, user UserLogin) (*ExternalUserInfo, error)
	SyncUser(ctx *Context, user UserLogin) (*ExternalUserInfo, error)
	GetIpasUserFor(ctx *Context, ldapUser *LdapUserInfo) (*ExternalUserInfo, error)
}

type ldapAuther struct {
	server            *config.LdapServerConf
	conn              ILdapConn
	requireSecondBind bool
}

var NewLdapAuthenticator = func(server *config.LdapServerConf) ILdapAuther {
	return &ldapAuther{server: server}
}

var ldapDial = func(network, addr string) (ILdapConn, error) {
	return ldap.Dial(network, addr)
}

func (a *ldapAuther) Dial() error {
	var err error
	var certPool *x509.CertPool
	if a.server.RootCACert != "" {
		certPool = x509.NewCertPool()
		for _, caCertFile := range strings.Split(a.server.RootCACert, " ") {
			pem, err := ioutil.ReadFile(caCertFile)
			if err != nil {
				log.Debugf("Error On Read Cerfificate: %s", err)
				return err
			}
			if !certPool.AppendCertsFromPEM(pem) {
				return errors.New("Failed to append CA certificate " + caCertFile)
			}
		}
	}
	var clientCert tls.Certificate
	if a.server.ClientCert != "" && a.server.ClientKey != "" {
		clientCert, err = tls.LoadX509KeyPair(a.server.ClientCert, a.server.ClientKey)
		if err != nil {
			log.Debugf("LDAP DIAL ERR: %s", err)
			return err
		}
	}
	for _, host := range strings.Split(a.server.Host, " ") {
		address := fmt.Sprintf("%s:%d", host, a.server.Port)
		if a.server.UseSSL {
			tlsCfg := &tls.Config{
				InsecureSkipVerify: a.server.SkipVerifySSL,
				ServerName:         host,
				RootCAs:            certPool,
			}
			if len(clientCert.Certificate) > 0 {
				tlsCfg.Certificates = append(tlsCfg.Certificates, clientCert)
			}
			if a.server.StartTLS {
				a.conn, err = ldap.Dial("tcp", address)
				if err == nil {
					if err = a.conn.StartTLS(tlsCfg); err == nil {
						return nil
					}
				}
			} else {
				a.conn, err = ldap.DialTLS("tcp", address, tlsCfg)
			}
		} else {
			a.conn, err = ldapDial("tcp", address)
		}

		if err == nil {
			return nil
		}
	}
	return err
}

func (a *ldapAuther) Login(ctx *Context, user UserLogin) (*ExternalUserInfo, error) {
	// connect to ldap server
	if err := a.Dial(); err != nil {
		log.Errorf("Error on Dialing LDAP Server %#+v, ERROR %s", a.server, err)
		return nil, err
	}
	defer a.conn.Close()

	// perform initial authentication
	if err := a.initialBind(user.UserName, user.Password); err != nil {
		log.Errorf("Error on Initial Bind %s", err)
		return nil, err
	}

	// find user entry & attributes
	ldapUser, err := a.searchForUser(user.UserName)
	if err != nil {
		log.Errorf("Error on Search For user %s", err)
		return nil, err
	}

	log.Debug("Ldap User found", spew.Sdump(ldapUser))

	// check if a second user bind is needed
	if a.requireSecondBind {
		err = a.secondBind(ldapUser, user.Password)
		if err != nil {
			log.Errorf("Error on  Second Bind %s", err)
			return nil, err
		}
	}

	ipasUser, err := a.GetIpasUserFor(ctx, ldapUser)
	if err != nil {
		log.Warnf("ON GetIpasUserFor : ERROR: %s", err)
		return nil, err
	}

	//user.User = ipasUser
	return ipasUser, nil
}

func (a *ldapAuther) SyncUser(ctx *Context, user UserLogin) (*ExternalUserInfo, error) {
	// connect to ldap server
	err := a.Dial()
	if err != nil {
		return nil, err
	}
	defer a.conn.Close()

	err = a.serverBind()
	if err != nil {
		return nil, err
	}

	// find user entry & attributes
	ldapUser, err := a.searchForUser(user.UserName)
	if err != nil {
		log.Error("Failed searching for user in ldap", "error", err)
		return nil, err
	}

	log.Debug("Ldap User found:", spew.Sdump(ldapUser))

	ipasUser, err := a.GetIpasUserFor(ctx, ldapUser)
	if err != nil {
		return nil, err
	}

	return ipasUser, nil
}

func (a *ldapAuther) GetIpasUserFor(ctx *Context, ldapUser *LdapUserInfo) (*ExternalUserInfo, error) {
	extUser := &ExternalUserInfo{
		AuthModule: "ldap",
		AuthId:     ldapUser.DN,
		Name:       fmt.Sprintf("%s %s", ldapUser.FirstName, ldapUser.LastName),
		Login:      ldapUser.Username,
		Email:      ldapUser.Email,
		Groups:     ldapUser.MemberOf,
		OrgRoles:   map[int64]config.RoleType{},
	}

	log.Debug("EXT USER FOUND:", spew.Sdump(extUser))

	for _, group := range a.server.LdapGroups {
		log.Debugf("Checking for Groups %+v", group)
		// only use the first match for each org
		if extUser.OrgRoles[group.OrgId] != "" {
			continue
		}

		if ldapUser.isMemberOf(group.GroupDN) {
			extUser.OrgRoles[group.OrgId] = group.OrgRole
			if extUser.IsSuperAdmin == nil || !*extUser.IsSuperAdmin {
				extUser.IsSuperAdmin = group.IsSuperAdmin
			}
		}
	}

	// validate that the user has access
	// if there are no ldap group mappings access is true
	// otherwise a single group must match
	if len(a.server.LdapGroups) > 0 && len(extUser.OrgRoles) < 1 {
		log.Info(
			"Ldap Auth: user does not belong in any of the specified ldap groups",
			"username", ldapUser.Username,
			"groups", ldapUser.MemberOf)
		return nil, ErrInvalidCredentials
	}

	/* add/update user in ipas
	upsertUserCmd := &m.UpsertUserCommand{
		ReqContext:    ctx,
		ExternalUser:  extUser,
		SignupAllowed: setting.LdapAllowSignup,
	}

	err := bus.Dispatch(upsertUserCmd)
	if err != nil {
		return nil, err
	}

	return upsertUserCmd.Result, nil
	*/
	log.Infof("LDAP FOUND %+v", extUser)
	return extUser, nil
}

func (a *ldapAuther) serverBind() error {
	// bind_dn and bind_password to bind
	if err := a.conn.Bind(a.server.BindDN, a.server.BindPassword); err != nil {
		log.Infof("LDAP initial bind failed, %v", err)

		if ldapErr, ok := err.(*ldap.Error); ok {
			if ldapErr.ResultCode == 49 {
				return ErrInvalidCredentials
			}
		}
		return err
	}

	return nil
}

func (a *ldapAuther) secondBind(ldapUser *LdapUserInfo, userPassword string) error {
	if err := a.conn.Bind(ldapUser.DN, userPassword); err != nil {
		log.Info("Second bind failed", "error", err)

		if ldapErr, ok := err.(*ldap.Error); ok {
			if ldapErr.ResultCode == 49 {
				return ErrInvalidCredentials
			}
		}
		return err
	}

	return nil
}

func (a *ldapAuther) initialBind(username, userPassword string) error {
	if a.server.BindPassword != "" || a.server.BindDN == "" {
		userPassword = a.server.BindPassword
		a.requireSecondBind = true
	}

	bindPath := a.server.BindDN
	if strings.Contains(bindPath, "%s") {
		bindPath = fmt.Sprintf(a.server.BindDN, username)
	}

	if err := a.conn.Bind(bindPath, userPassword); err != nil {
		log.Info("Initial bind failed", "error", err)

		if ldapErr, ok := err.(*ldap.Error); ok {
			if ldapErr.ResultCode == 49 {
				return ErrInvalidCredentials
			}
		}
		return err
	}

	return nil
}

func appendIfNotEmpty(slice []string, values ...string) []string {
	for _, v := range values {
		if v != "" {
			slice = append(slice, v)
		}
	}
	return slice
}

func (a *ldapAuther) searchForUser(username string) (*LdapUserInfo, error) {
	var searchResult *ldap.SearchResult
	var err error

	for _, searchBase := range a.server.SearchBaseDNs {
		attributes := make([]string, 0)
		inputs := a.server.Attr
		attributes = appendIfNotEmpty(attributes,
			inputs.Username,
			inputs.Surname,
			inputs.Email,
			inputs.Name,
			inputs.MemberOf)

		searchReq := ldap.SearchRequest{
			BaseDN:       searchBase,
			Scope:        ldap.ScopeWholeSubtree,
			DerefAliases: ldap.NeverDerefAliases,
			Attributes:   attributes,
			Filter:       strings.Replace(a.server.SearchFilter, "%s", ldap.EscapeFilter(username), -1),
		}

		log.Debug("Ldap Search For User Request", "info", spew.Sdump(searchReq))

		searchResult, err = a.conn.Search(&searchReq)
		if err != nil {
			return nil, err
		}

		if len(searchResult.Entries) > 0 {
			break
		}
	}

	if len(searchResult.Entries) == 0 {
		return nil, ErrInvalidCredentials
	}

	if len(searchResult.Entries) > 1 {
		return nil, errors.New("Ldap search matched more than one entry, please review your filter setting")
	}

	var memberOf []string
	if a.server.GroupSearchFilter == "" {
		memberOf = getLdapAttrArray(a.server.Attr.MemberOf, searchResult)
	} else {
		// If we are using a POSIX LDAP schema it won't support memberOf, so we manually search the groups
		var groupSearchResult *ldap.SearchResult
		for _, groupSearchBase := range a.server.GroupSearchBaseDNs {
			var filter_replace string
			if a.server.GroupSearchFilterUserAttribute == "" {
				filter_replace = getLdapAttr(a.server.Attr.Username, searchResult)
			} else {
				filter_replace = getLdapAttr(a.server.GroupSearchFilterUserAttribute, searchResult)
			}

			filter := strings.Replace(a.server.GroupSearchFilter, "%s", ldap.EscapeFilter(filter_replace), -1)

			log.Info("Searching for user's groups", "filter", filter)

			// support old way of reading settings
			groupIdAttribute := a.server.Attr.MemberOf
			// but prefer dn attribute if default settings are used
			if groupIdAttribute == "" || groupIdAttribute == "memberOf" {
				groupIdAttribute = "dn"
			}

			groupSearchReq := ldap.SearchRequest{
				BaseDN:       groupSearchBase,
				Scope:        ldap.ScopeWholeSubtree,
				DerefAliases: ldap.NeverDerefAliases,
				Attributes:   []string{groupIdAttribute},
				Filter:       filter,
			}

			groupSearchResult, err = a.conn.Search(&groupSearchReq)
			if err != nil {
				return nil, err
			}

			if len(groupSearchResult.Entries) > 0 {
				for i := range groupSearchResult.Entries {
					memberOf = append(memberOf, getLdapAttrN(groupIdAttribute, groupSearchResult, i))
				}
				break
			}
		}
	}

	return &LdapUserInfo{
		DN:        searchResult.Entries[0].DN,
		LastName:  getLdapAttr(a.server.Attr.Surname, searchResult),
		FirstName: getLdapAttr(a.server.Attr.Name, searchResult),
		Username:  getLdapAttr(a.server.Attr.Username, searchResult),
		Email:     getLdapAttr(a.server.Attr.Email, searchResult),
		MemberOf:  memberOf,
	}, nil
}

func getLdapAttrN(name string, result *ldap.SearchResult, n int) string {
	if strings.ToLower(name) == "dn" {
		return result.Entries[n].DN
	}
	for _, attr := range result.Entries[n].Attributes {
		if attr.Name == name {
			if len(attr.Values) > 0 {
				return attr.Values[0]
			}
		}
	}
	return ""
}

func getLdapAttr(name string, result *ldap.SearchResult) string {
	return getLdapAttrN(name, result, 0)
}

func getLdapAttrArray(name string, result *ldap.SearchResult) []string {
	for _, attr := range result.Entries[0].Attributes {
		if attr.Name == name {
			return attr.Values
		}
	}
	return []string{}
}
