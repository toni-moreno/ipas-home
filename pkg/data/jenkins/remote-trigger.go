package jenkins

import (
	"bytes"
	"net/http"

	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"github.com/bndr/gojenkins"
)

var (
	log     *logrus.Logger
	confDir string              //Needed to get File Filters data
	dbc     *config.DatabaseCfg //Needed to get Custom Filter  data

	jenkins *gojenkins.Jenkins
)

// SetConfDir  enable load File Filters from anywhere in the our FS.
func SetConfDir(dir string) {
	confDir = dir
}

// SetDB load database config to load data if needed (used in filters)
func SetDB(db *config.DatabaseCfg) {
	dbc = db
}

// SetLogger set output log
func SetLogger(l *logrus.Logger) {
	log = l
}

// Init
func Init(cfg *config.JenkinsConfig) error {
	log.Debug("JENKNS CREATE for %+v", cfg)
	client := &http.Client{
		Timeout: cfg.Timeout,
	}

	// Provide CA certificate if server is using self-signed certificate
	// caCert, _ := ioutil.ReadFile("/tmp/ca.crt")
	// jenkins.Requester.CACert = caCert
	j, err := gojenkins.CreateJenkins(client, cfg.URL, cfg.User, cfg.Password).Init()
	if err != nil {
		log.Error("Something Went Wrong when trying to initialize Jenkins URL %s, User: %s, Password %s: Error: %s", cfg.URL, cfg.User, cfg.Password, err)
		return err
	}
	jenkins = j
	log.Debug("JENKNS CREATE OK : %#+v", jenkins)
	return nil
}

/*
//TRIGGERURL="${HOST}/job/${JOBNAME}/buildWithParameters?${JOBPARAM}"
//http://${USER}:${PASS}@${HOST}/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,"'":"'",//crumb)"
funct(jj *JenkinsJob) getCrumb() {
	AUTH="-H $CRUMB -u ${USER}:${PASS}"
}

func (jj *JenkinsJob) getQueue() {
	//AUTH="-H $CRUMB -u ${USER}:${PASS}"
	//curl --noproxy '*' $AUTH -s -D - -X POST "$TRIGGERURL"`
	//QID=`echo "$TMP" | grep Location | cut -d "/" -f 6`
}


func (jj *JenkinsJob) getQueue() {
	//QUEUE_URL="${HOST}/queue/item/${QID}/api/json?pretty=true"
}*/

/*func jobID2Map(id string) string {
	switch id {
	}

}*/

func Send(id string, filename string, content *bytes.Buffer) (int64, error) {
	job, err := jenkins.GetJob("add_update_grafana_dashboard")
	if err != nil {
		log.Errorf("Error on get Job. Error %s ", err)
		return 0, err
	}

	var params = map[string]string{
		"SERVER":       "http://grafana:3000",
		"USER":         "ipas_admin",
		"PASSWORD":     "1p4sm0l4",
		"PRODUCT":      "a10",
		"PRODUCT_TAGS": "tag1,tag2,tag3",
	}

	jid, err := job.InvokeSimple(params)
	if err != nil {
		log.Error("Some error triggered while invoking job Error %s", err)
	}

	return jid, nil
}
