package login

import (
	"github.com/Sirupsen/logrus"
	"github.com/toni-moreno/ipas-home/pkg/config"
)

var (
	logDir         string
	confDir        string
	log            *logrus.Logger
	confLDAP       *config.LdapConfig
	superAdminUser string
	superAdminPass string
)

func SetAuthLdap(cfg *config.LdapConfig) {
	confLDAP = cfg
}

func SetSuperAdminCred(user string, pass string) {
	superAdminUser = user
	superAdminPass = pass
}

// SetLogger set output log
func SetLogger(l *logrus.Logger) {
	log = l
}
