package jenkins

import (
	"net"
	"net/http"

	"github.com/Sirupsen/logrus"
	"github.com/bndr/gojenkins"
	"github.com/toni-moreno/ipas-home/pkg/config"
)

var (
	log         *logrus.Logger
	confDir     string              //Needed to get File Filters data
	dbc         *config.DatabaseCfg //Needed to get Custom Filter  data
	downloadDir string
	jnks        *gojenkins.Jenkins
	url         string
	publicURL   string
	emailNotif  string
)

// SetConfDir  enable load File Filters from anywhere in the our FS.
func SetConfDir(dir string) {
	confDir = dir
}

// SetDownloadDir  enable load File Filters from anywhere in the our FS.
func SetDownloadDir(dir string) {
	downloadDir = dir
}

// SetDB load database config to load data if needed (used in filters)
func SetDB(db *config.DatabaseCfg) {
	dbc = db
}

// SetLogger set output log
func SetLogger(l *logrus.Logger) {
	log = l
}

// initJenkins
func initJenkins(cfg *config.JenkinsConfig) error {
	log.Debugf("JENKNS CREATE for %+v", cfg)
	url = cfg.URL
	emailNotif = cfg.EmailNotif
	publicURL = cfg.PublicURL
	client := &http.Client{
		Timeout: cfg.Timeout,
	}

	// Provide CA certificate if server is using self-signed certificate
	// caCert, _ := ioutil.ReadFile("/tmp/ca.crt")
	// jenkins.Requester.CACert = caCert
	j, err := gojenkins.CreateJenkins(client, cfg.URL, cfg.User, cfg.Password).Init()
	if err != nil {
		log.Errorf("Something Went Wrong when trying to initialize Jenkins URL %s, User: %s, Password %s: Error: %s", cfg.URL, cfg.User, cfg.Password, err)
		return err
	}
	jnks = j
	log.Infof("JENKINS CREATE OK : %#+v", jnks)
	return nil
}

// Init initialize jenkins
func Init(cfg *config.JenkinsConfig) {
	initJenkins(cfg)
	initJobUpdater(cfg)
}

// GetOutboundIP Get preferred outbound ip of this machine
func GetOutboundIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)

	return localAddr.IP.String()
}
