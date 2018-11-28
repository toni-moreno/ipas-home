package jenkins

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net"
	"net/http"
	"path/filepath"
	"time"

	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"github.com/bndr/gojenkins"
)

var (
	log         *logrus.Logger
	confDir     string              //Needed to get File Filters data
	dbc         *config.DatabaseCfg //Needed to get Custom Filter  data
	downloadDir string
	jenkins     *gojenkins.Jenkins
)

// SetConfDir  enable load File Filters from anywhere in the our FS.
func SetConfDir(dir string) {
	confDir = dir
}

// SetConfDir  enable load File Filters from anywhere in the our FS.
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

// Get preferred outbound ip of this machine
func GetOutboundIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)

	return localAddr.IP.String()
}

type AnsibleInventory struct {
	All struct {
		Vars  map[string]interface{}            `json:"vars"`
		Hosts map[string]map[string]interface{} `json:"hosts"`
	} `json:"all"`
}

type PlatformData struct {
	ProductID string `json:"productid"`
	Tags      []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	} `json:"tags"`
	Engine []struct {
		Name     string `json:"name"`
		Platform struct {
			ID       string `json:"ID"`
			EngineID string `json:"EngineID"`
			LabSvcID string `json:"LabSvcID"`
			TstSvcID string `json:"TstSvcID"`
			PreSvcID string `json:"PreSvcID"`
			ProSvcID string `json:"ProSvcID"`
		} `json: "platform"`
	} `json: "engine"`
}

type EngineParam struct {
	AgentKey    string      `json:"agent_key"`
	Description string      `json:"description"`
	Key         string      `json:"key"`
	Type        string      `json:"type"`
	Value       interface{} `json:"value"`
}

type EngineConfig struct {
	Name   string        `json:"name"`
	Config string        `json:"config"`
	Params []EngineParam `json:"params"`
}

type DeviceData struct {
	ID     string         `json:"id"`
	Engine []EngineConfig `json:"engine"`
}

type JobData struct {
	Platform PlatformData `json:"platform"`
	Devices  []DeviceData `json:"devices"`
}

func GetGlobalVarKeysByEngine(data *JobData, engine string) map[string]interface{} {
	switch engine {
	case "snmpcollector":
		return map[string]interface{}{
			"snmpcollector_user":   "admin",
			"snmpcollector_pass":   "admin",
			"snmpcollector_server": "http://snmpcollector:8090",
			"product_name":         data.Platform.ProductID,
		}
	default:
		log.Warnf("There is no global keys definitions for engine %s", engine)
	}
	return nil
}

type JobEngineConfig struct {
	Lab map[string]interface{} `json:"lab"`
	TST map[string]interface{} `json:"tst"`
	PRE map[string]interface{} `json:"pre"`
	PRO map[string]interface{} `json:"pro"`
}

func CreateJobEngineConfig(data *JobData, engine string) *JobEngineConfig {
	var jecfg JobEngineConfig
	for _, eng := range data.Platform.Engine {
		if eng.Name == engine {
			//LAB
			lab_qid := eng.Platform.LabSvcID
			if len(lab_qid) > 0 {
				svc, err := dbc.GetServiceCfgByID(lab_qid)
				if err == nil {
					jecfg.Lab = GetGlobalVarKeysByEngine(data, engine)
					jecfg.Lab["snmpcollector_user"] = svc.AdmUser
					jecfg.Lab["snmpcollector_pass"] = svc.AdmPasswd
					jecfg.Lab["snmpcollector_server"] = svc.Link
				} else {
					log.Error("Error on get Service %s", err)
				}

			}
			//TST
			tst_qid := eng.Platform.TstSvcID
			if len(tst_qid) > 0 {
				svc, err := dbc.GetServiceCfgByID(tst_qid)
				if err == nil {
					jecfg.TST = GetGlobalVarKeysByEngine(data, engine)
					jecfg.TST["snmpcollector_user"] = svc.AdmUser
					jecfg.TST["snmpcollector_pass"] = svc.AdmPasswd
					jecfg.TST["snmpcollector_server"] = svc.Link
				} else {
					log.Error("Error on get Service %s", err)
				}
			}
			//PRE
			pre_qid := eng.Platform.PreSvcID
			if len(pre_qid) > 0 {
				svc, err := dbc.GetServiceCfgByID(pre_qid)
				if err == nil {
					jecfg.PRE = GetGlobalVarKeysByEngine(data, engine)
					jecfg.PRE["snmpcollector_user"] = svc.AdmUser
					jecfg.PRE["snmpcollector_pass"] = svc.AdmPasswd
					jecfg.PRE["snmpcollector_server"] = svc.Link
				} else {
					log.Error("Error on get Service %s", err)
				}
			}

			pro_qid := eng.Platform.ProSvcID

			if len(pro_qid) > 0 {
				svc, err := dbc.GetServiceCfgByID(pro_qid)
				if err == nil {
					jecfg.PRO = GetGlobalVarKeysByEngine(data, engine)
					jecfg.PRO["snmpcollector_user"] = svc.AdmUser
					jecfg.PRO["snmpcollector_pass"] = svc.AdmPasswd
					jecfg.PRO["snmpcollector_server"] = svc.Link
				} else {
					log.Error("Error on get Service %s", err)
				}

			}
		}
	}
	log.Debugf("JOBEngineConfig : %#+v", jecfg)
	return &jecfg
}

func CreateAnsibleInventory(data *JobData, engine string) *AnsibleInventory {
	inv := &AnsibleInventory{}
	// las variables globales dependeran del producto
	inv.All.Vars = GetGlobalVarKeysByEngine(data, engine)
	// host parámeters are
	inv.All.Hosts = make(map[string]map[string]interface{})
	for _, dev := range data.Devices {
		for _, eng := range dev.Engine {
			if eng.Name == engine {
				log.Infof("Detected device %s for Engine %s", dev.ID, engine)
				m := make(map[string]interface{})
				for _, param := range eng.Params {
					log.Debug("Detected parameter %s : %s", param.Key, param.Value)
					m[param.Key] = param.Value
				}
				inv.All.Hosts[dev.ID] = m
			}
		}
	}
	return inv
}

func SaveConfigFiles(data *JobData) (string, string) {

	inv_data := CreateAnsibleInventory(data, "snmpcollector")
	jec_data := CreateJobEngineConfig(data, "snmpcollector")

	pfm_data, err := json.MarshalIndent(jec_data, "", "  ")
	if err != nil {
		log.Warnf("Error on Marshall Platform data %s", err)
	}

	dev_data, err := json.MarshalIndent(inv_data, "", "  ")
	if err != nil {
		log.Warnf("Error on Marshall  Device Data %s", err)
	}

	t := time.Now()

	purl_filename := t.Format("20060102150405") + "_platform_config.json"
	dev_filename := t.Format("20060102150405") + "_device_config.json"

	err = ioutil.WriteFile(filepath.Join(downloadDir, purl_filename), pfm_data, 0644)
	if err != nil {
		log.Errorf("Error on Write Platform Config File  %s", filepath.Join(downloadDir, purl_filename))
	}
	err = ioutil.WriteFile(filepath.Join(downloadDir, dev_filename), dev_data, 0644)
	if err != nil {
		log.Errorf("Error on Write Device Config File  %s", filepath.Join(downloadDir, dev_filename))
	}

	ip := GetOutboundIP()

	purl := "http://" + ip + ":5090/api/rt/agent/download/" + purl_filename
	durl := "http://" + ip + ":5090/api/rt/agent/download/" + dev_filename

	return purl, durl
}

func Send(id string, filename string, content *bytes.Buffer) (int64, error) {
	//Unmarshall file into Job Data

	var jobdt JobData

	if err := json.Unmarshal(content.Bytes(), &jobdt); err != nil {
		log.Errorf("error on unmarshall JobData %s", err)
	}
	log.Debugf("DATA %#+v", jobdt)

	log.Infof("Trying to get JOB %s", id)

	job, err := jenkins.GetJob(id)
	if err != nil {
		log.Errorf("Error on get Job. Error %s ", err)
		return 0, err
	}

	purl, durl := SaveConfigFiles(&jobdt)

	var params = map[string]string{
		"PLATFORM_CONFIG_URL": purl,
		"DEVICE_CONFIG_URL":   durl,
	}

	jid, err := job.InvokeSimple(params)
	if err != nil {
		log.Error("Some error triggered while invoking job Error %s", err)
	}

	return jid, nil
}
