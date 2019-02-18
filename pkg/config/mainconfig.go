package config

import (
	"time"

	"github.com/go-xorm/xorm"
)

// GeneralConfig has miscellaneous configuration options
type GeneralConfig struct {
	InstanceID  string `mapstructure:"instanceID"`
	LogDir      string `mapstructure:"logdir"`
	HomeDir     string `mapstructure:"homedir"`
	DataDir     string `mapstructure:"datadir"`
	LogLevel    string `mapstructure:"logLevel"`
	DownloadDir string `mapstructure:"downloaddir"`
}

//DatabaseCfg de configuration for the database
type DatabaseCfg struct {
	Type       string `mapstructure:"type"`
	Host       string `mapstructure:"host"`
	Name       string `mapstructure:"name"`
	User       string `mapstructure:"user"`
	Password   string `mapstructure:"password"`
	SQLLogFile string `mapstructure:"sqllogfile"`
	Debug      string `mapstructure:"debug"`
	x          *xorm.Engine
	numChanges int64 `mapstructure:"-"`
}

//SelfMonConfig configuration for self monitoring
type SelfMonConfig struct {
	Enabled           bool     `mapstructure:"enabled"`
	Freq              int      `mapstructure:"freq"`
	Prefix            string   `mapstructure:"prefix"`
	InheritDeviceTags bool     `mapstructure:"inheritdevicetags"`
	ExtraTags         []string `mapstructure:"extratags"`
}

//HTTPConfig has webserver config options
type HTTPConfig struct {
	Port          int    `mapstructure:"port"`
	AdminUser     string `mapstructure:"adminuser"`
	AdminPassword string `mapstructure:"adminpassword"`
	CookieID      string `mapstructure:"cookieid"`
}

//GitRepo main Product Repo config
type GitRepo struct {
	CloneSource  string `mapstructure:"clonesource"`
	ClonePath    string `mapstructure:"clonepath"`
	WorkOnBranch string `mapstructure:"workonbranch"`
	Name         string `mapstructure:"name"`
	Email        string `mapstructure:"email"`
}

type JenkinsConfig struct {
	URL        string        `mapstructure:"url"`
	PublicURL  string        `mapstructure:"public_url"`
	User       string        `mapstructure:"user"`
	Password   string        `mapstructure:"password"`
	Timeout    time.Duration `mapstructure:"timeout"`
	UpdateFreq time.Duration `mapstructure:"updatefreq"`
	EmailNotif string        `mapstructure:"email_notif"`
}

type LdapConfig struct {
	Enabled     bool              `mapstructure:"enabled"`
	AllowSignUp bool              `mapstructure:"allow_sign_up"`
	Servers     []*LdapServerConf `mapstructure:"servers"`
}

type LdapServerConf struct {
	Host          string           `mapstructure:"host"`
	Port          int              `mapstructure:"port"`
	UseSSL        bool             `mapstructure:"use_ssl"`
	StartTLS      bool             `mapstructure:"start_tls"`
	SkipVerifySSL bool             `mapstructure:"ssl_skip_verify"`
	RootCACert    string           `mapstructure:"root_ca_cert"`
	ClientCert    string           `mapstructure:"client_cert"`
	ClientKey     string           `mapstructure:"client_key"`
	BindDN        string           `mapstructure:"bind_dn"`
	BindPassword  string           `mapstructure:"bind_password"`
	Attr          LdapAttributeMap `mapstructure:"attributes"`

	SearchFilter  string   `mapstructure:"search_filter"`
	SearchBaseDNs []string `mapstructure:"search_base_dns"`

	GroupSearchFilter              string   `mapstructure:"group_search_filter"`
	GroupSearchFilterUserAttribute string   `mapstructure:"group_search_filter_user_attribute"`
	GroupSearchBaseDNs             []string `mapstructure:"group_search_base_dns"`

	LdapGroups []*LdapGroupToOrgRole `mapstructure:"group_mappings"`
}

type LdapAttributeMap struct {
	Username string `mapstructure:"username"`
	Name     string `mapstructure:"name"`
	Surname  string `mapstructure:"surname"`
	Email    string `mapstructure:"email"`
	MemberOf string `mapstructure:"member_of"`
}

type RoleType string

const (
	ROLE_VIEWER RoleType = "Viewer"
	ROLE_EDITOR RoleType = "Editor"
	ROLE_ADMIN  RoleType = "Admin"
)

type LdapGroupToOrgRole struct {
	GroupDN      string   `mapstructure:"group_dn"`
	OrgId        int64    `mapstructure:"org_id"`
	IsSuperAdmin *bool    `mapstructure:"super_admin"` // This is a pointer to know if it was set or not (for backwards compatibility)
	OrgRole      RoleType `mapstructure:"org_role"`
}

// Config All resitor configuration
type Config struct {
	General     GeneralConfig `mapstructure:"general"`
	Database    DatabaseCfg   `mapstructure:"database"`
	Selfmon     SelfMonConfig `mapstructure:"selfmon"`
	HTTP        HTTPConfig    `mapstructure:"http"`
	ProductRepo GitRepo       `mapstructure:"productrepo"`
	Jenkins     JenkinsConfig `mapstructure:"jenkins"`
	AuthLDAP    LdapConfig    `mapstructure:"auth_ldap"`
}

//var MainConfig Config
