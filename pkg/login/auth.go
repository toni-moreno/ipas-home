package login

import (
	"errors"

	"github.com/davecgh/go-spew/spew"
	"github.com/toni-moreno/ipas-home/pkg/config"
)

//UserLogin for login purposes
type UserLogin struct {
	UserName string `form:"username" binding:"Required"`
	Password string `form:"password" binding:"Required"`
}

type ExternalUserInfo struct {
	AuthModule   string
	AuthId       string
	UserId       int64
	Email        string
	Login        string
	Name         string
	Groups       []string
	OrgRoles     map[int64]config.RoleType
	IsSuperAdmin *bool // This is a pointer to know if we should sync this or not (nil = ignore sync)
}

var (
	ErrUserNotFound          = errors.New("User not found")
	ErrEmailNotAllowed       = errors.New("Required email domain not fulfilled")
	ErrInvalidCredentials    = errors.New("Invalid Username or Password")
	ErrNoEmail               = errors.New("Login provider didn't return an email address")
	ErrProviderDeniedRequest = errors.New("Login provider denied login request")
	ErrSignUpNotAllowed      = errors.New("Signup is not allowed for this adapter")
	ErrTooManyLoginAttempts  = errors.New("Too many consecutive incorrect login attempts for user. Login for user temporarily blocked")
	ErrPasswordEmpty         = errors.New("No password provided.")
	ErrUsersQuotaReached     = errors.New("Users quota reached")
	ErrGettingUserQuota      = errors.New("Error getting user quota")
)

func LoginSuperAdmin(ctx *Context, user UserLogin) error {

	if user.UserName != superAdminUser {
		return ErrUserNotFound
	}

	if user.Password == superAdminPass {
		ctx.SignedInUser = user.UserName
		ctx.IsSignedIn = true
		ctx.Session.Set(SessKeyUserID, user.UserName)
		log.Info("Super Admin login OK")
		return nil
	} else {
		return ErrInvalidCredentials
	}
}

func loginUsingLdap(ctx *Context, user UserLogin) (bool, error) {
	if !confLDAP.Enabled {
		return false, nil
	}

	for _, server := range confLDAP.Servers {
		author := NewLdapAuthenticator(server)
		euser, err := author.Login(ctx, user)
		if err == nil || err != ErrInvalidCredentials {
			log.Infof("LDAP USER: %s Log in OK", euser.Login)
			ctx.SignedInUser = euser.Login
			ctx.IsSignedIn = true
			ctx.Session.Set(SessKeyUserID, euser.Login)
			log.Debugf("LDAP USER: %s", spew.Sdump(euser))
			return true, err
		}
	}

	return true, ErrInvalidCredentials
}

func AuthenticateUser(ctx *Context, user UserLogin) error {
	//if err := validateLoginAttempts(user.Username); err != nil {
	//	return err
	//}

	if err := validatePasswordSet(user.Password); err != nil {
		return err
	}

	err := LoginSuperAdmin(ctx, user)
	if err == nil || (err != ErrUserNotFound && err != ErrInvalidCredentials) {
		return err
	}

	ldapEnabled, ldapErr := loginUsingLdap(ctx, user)
	if ldapEnabled {
		if ldapErr == nil || ldapErr != ErrInvalidCredentials {
			return ldapErr
		}

		err = ldapErr
	}

	if err == ErrInvalidCredentials {
		//saveInvalidLoginAttempt(ctx, user)
		log.Debug("Saving invalid login Attempt")
	}

	if err == ErrUserNotFound {
		return ErrInvalidCredentials
	}

	return err
}

func validatePasswordSet(password string) error {
	if len(password) == 0 {
		return ErrPasswordEmpty
	}

	return nil
}
