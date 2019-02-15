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

// Config All resitor configuration
type Config struct {
	General     GeneralConfig
	Database    DatabaseCfg
	Selfmon     SelfMonConfig
	HTTP        HTTPConfig
	ProductRepo GitRepo
	Jenkins     JenkinsConfig
}

//var MainConfig Config
