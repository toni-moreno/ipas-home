package jenkins

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"strings"
	"time"

	"github.com/toni-moreno/ipas-home/pkg/config"
	"github.com/toni-moreno/ipas-home/pkg/data/repo"
)

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
	Engine []config.PlatformEngAux `json:"engine"`
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

type JobDeviceData struct {
	Platform PlatformData `json:"platform"`
	Devices  []DeviceData `json:"devices"`
}

type JobProductData struct {
	Platform PlatformData `json:"platform"`
	Product  repo.Product `json:"product"`
}

func GetGlobalVarKeysByEngine(data *JobDeviceData, engine string, svc config.ServiceCfg) map[string]interface{} {
	switch engine {
	case "snmpcollector":
		return map[string]interface{}{
			"snmpcollector_user":   svc.AdmUser,
			"snmpcollector_pass":   svc.AdmPasswd,
			"snmpcollector_server": svc.Link,
			"product_name":         data.Platform.ProductID,
		}
	case "telegraf":
		dbmap, err := dbc.GetProductDBMapByID(data.Platform.ProductID)
		if err != nil {
			log.Warnf("There is no database MAP defined for Product: %s ERR: %s", data.Platform.ProductID, err)
			return nil
		}
		return map[string]interface{}{
			"influx_rw_user":    svc.AdmUser,
			"influx_rw_passwd":  svc.AdmPasswd,
			"influx_server_url": svc.Link,
			"influx_database":   dbmap.Database,
			"product_name":      data.Platform.ProductID,
		}
	default:
		log.Warnf("There is no global keys definitions for engine %s", engine)
	}
	return nil
}

func GetGlobalVarKeys(data *JobDeviceData, engine string) map[string]interface{} {
	return map[string]interface{}{
		"product_name": data.Platform.ProductID,
	}
}

type JobEngineConfig struct {
	Lab map[string]interface{} `json:"lab"`
	TST map[string]interface{} `json:"tst"`
	PRE map[string]interface{} `json:"pre"`
	PRO map[string]interface{} `json:"pro"`
}

func CreateJobEngineConfig(data *JobDeviceData, engine string) *JobEngineConfig {
	var jecfg JobEngineConfig
	for _, eng := range data.Platform.Engine {
		if eng.Name == engine {
			//LAB
			labQid := eng.Platform.LabSvcID
			if len(labQid) > 0 {
				svc, err := dbc.GetServiceCfgByID(labQid)
				if err == nil {
					jecfg.Lab = GetGlobalVarKeysByEngine(data, engine, svc)
				} else {
					log.Errorf("Error on get Service %s", err)
				}
			}
			//TST
			tstQid := eng.Platform.TstSvcID
			if len(tstQid) > 0 {
				svc, err := dbc.GetServiceCfgByID(tstQid)
				if err == nil {
					jecfg.TST = GetGlobalVarKeysByEngine(data, engine, svc)
				} else {
					log.Errorf("Error on get Service %s", err)
				}
			}
			//PRE
			preQid := eng.Platform.PreSvcID
			if len(preQid) > 0 {
				svc, err := dbc.GetServiceCfgByID(preQid)
				if err == nil {
					jecfg.PRE = GetGlobalVarKeysByEngine(data, engine, svc)
				} else {
					log.Errorf("Error on get Service %s", err)
				}
			}
			//PRO
			proQid := eng.Platform.ProSvcID
			if len(proQid) > 0 {
				svc, err := dbc.GetServiceCfgByID(proQid)
				if err == nil {
					jecfg.PRO = GetGlobalVarKeysByEngine(data, engine, svc)
				} else {
					log.Errorf("Error on get Service %s", err)
				}
			}
		}
	}
	log.Debugf("JOBEngineConfig : %#+v", jecfg)
	return &jecfg
}

func CreateAnsibleInventory(data *JobDeviceData, engine string) *AnsibleInventory {
	inv := &AnsibleInventory{}
	// las variables globales dependeran del producto
	inv.All.Vars = GetGlobalVarKeys(data, engine)
	// host parameters are
	inv.All.Hosts = make(map[string]map[string]interface{})
	for _, dev := range data.Devices {
		for _, eng := range dev.Engine {
			if eng.Name == engine {
				log.Infof("Detected device %s for Engine %s", dev.ID, engine)
				m := make(map[string]interface{})
				m["device_config"] = eng.Config
				for _, param := range eng.Params {
					log.Debugf("Detected parameter %s : %#v", param.Key, param.Value)
					if param.Value != nil {
						m[param.Key] = param.Value
					}
				}
				inv.All.Hosts[dev.ID] = m
			}
		}
	}
	return inv
}

func SaveConfigFiles(data *JobDeviceData, engine string) (string, string) {

	invData := CreateAnsibleInventory(data, engine)
	jecData := CreateJobEngineConfig(data, engine)

	pfmData, err := json.MarshalIndent(jecData, "", "  ")
	if err != nil {
		log.Warnf("Error on Marshall Platform data %s", err)
	}

	devData, err := json.MarshalIndent(invData, "", "  ")
	if err != nil {
		log.Warnf("Error on Marshall  Device Data %s", err)
	}

	t := time.Now()

	purlFilename := t.Format("20060102150405") + "_platform_config.json"
	devFilename := t.Format("20060102150405") + "_device_config.json"

	err = ioutil.WriteFile(filepath.Join(downloadDir, purlFilename), pfmData, 0644)
	if err != nil {
		log.Errorf("Error on Write Platform Config File  %s", filepath.Join(downloadDir, purlFilename))
	}
	err = ioutil.WriteFile(filepath.Join(downloadDir, devFilename), devData, 0644)
	if err != nil {
		log.Errorf("Error on Write Device Config File  %s", filepath.Join(downloadDir, devFilename))
	}

	ip := GetOutboundIP()

	purl := "http://" + ip + ":5090/api/rt/agent/download/" + purlFilename
	durl := "http://" + ip + ":5090/api/rt/agent/download/" + devFilename

	return purl, durl
}

func SendDeviceAction(subject string, action string, filename string, content *bytes.Buffer) error {
	//Unmarshall file into Job Data
	var jobdt JobDeviceData

	if err := json.Unmarshal(content.Bytes(), &jobdt); err != nil {
		log.Errorf("error on unmarshall JobDeviceData %s", err)
		return err
	}
	log.Debugf("DATA %#+v", jobdt)

	taskmap := make(map[int64]*config.TaskStatus)

	for _, engine := range jobdt.Platform.Engine {

		id := subject + "_" + action + "_" + engine.Name

		log.Infof("Triggering Jenkins job %s", id)

		purl, durl := SaveConfigFiles(&jobdt, engine.Name)

		var params = map[string]string{
			"PLATFORM_CONFIG_URL": purl,
			"DEVICE_CONFIG_URL":   durl,
			"EMAIL_NOTIFICATION":  emailNotif,
		}

		job, err := jnks.GetJob(id)
		if err != nil {
			log.Errorf("Error on get Job. Error %s ", err)
			return err
		}

		jid, err := job.InvokeSimple(params)
		if err != nil {
			log.Errorf("Some error triggered while invoking job  %s for engine %s Error %s", id, engine.Name, err)
			continue
		}

		log.Infof("Invoked job with number %d", jid)

		//waiting for job info
		for {
			t, err := jnks.GetQueueItem(jid)
			if err != nil {
				log.Errorf("Some error triggered while invoking queue  %s for engine %s Error %s", id, engine.Name, err)
				continue
			}
			time.Sleep(5 * time.Second)
			log.Debugf("QUEUE  RAW %#+v", t.Raw)
			if len(t.Raw.Why) > 0 {
				log.Infof("Waiting while task in queue:%s", t.Raw.Why)
				time.Sleep(5 * time.Second)
			} else {
				log.Debugf("QUEUE  RAW %#+v", t.Raw)
				bid := t.Raw.Executable.Number

				purl := t.Raw.Executable.URL
				if len(publicURL) > 0 {
					log.Infof("setting public URL to %s", publicURL)
					purl = strings.Replace(t.Raw.Executable.URL, url, publicURL, -1)
				}

				taskmap[jid] = &config.TaskStatus{
					JobName:    id,
					TaskID:     jid,
					ExecID:     t.Raw.Executable.Number,
					IsFinished: false,
					ExecURL:    purl,
					Launched:   time.Now(),
					LastUpdate: time.Now(),
				}
				log.Infof("Set Executable  %d : URL Orig %s | URL  Final %s", bid, t.Raw.Executable.URL, purl)
				break
			}
		}

		//Updating

	}

	for _, d := range jobdt.Devices {

		PfmDevice := config.PlatformDevices{
			ProductID:       jobdt.Platform.ProductID,
			DeviceID:        d.ID,
			PlatformEngines: jobdt.Platform.Engine,
			LastState:       "PENDING",
			TaskStat:        taskmap,
		}

		_, err := dbc.AddOrUpdatePlatformDevices(PfmDevice)
		if err != nil {
			log.Errorf("While trying to insert data into PlatformDevices: %+v Error: %s", PfmDevice, err)
		}

		for _, e := range d.Engine {

			for _, p := range e.Params {
				jsvalue, err := json.Marshal(p.Value)
				if err != nil {
					log.Errorf("Error on marshalling parameter value %s : value  [ %+v ]: ERROR %s", p.Key, p.Value, err)
					continue
				}
				dcParams := config.DeviceConfigParams{
					ProductID: jobdt.Platform.ProductID,
					DeviceID:  d.ID,
					EngineID:  e.Name,
					ConfigID:  e.Config,
					Key:       p.Key,
					//Value:     p.Value,
					Value: string(jsvalue),
				}
				_, err2 := dbc.AddOrUpdateDeviceConfigParams(dcParams)
				if err2 != nil {
					log.Errorf("While trying to insert data into DeviceConfigParams: %+v Error: %s", dcParams, err)
				}

			}
		}
	}

	return nil
}

func SendProductAction(subject string, action string, filename string, content *bytes.Buffer) error {
	//Unmarshall file into Job Data
	var jobdt JobProductData

	if err := json.Unmarshal(content.Bytes(), &jobdt); err != nil {
		log.Errorf("error on unmarshall Job Product Data %s", err)
		return err
	}
	log.Debugf("DATA PRODUCT %#+v", jobdt)

	/*taskmap := make(map[int64]*config.TaskStatus)

	for _, engine := range jobdt.Platform.Engine {

		id := subject + "_" + action + "_" + engine.Name

		log.Infof("Triggering Jenkins job %s", id)

		job, err := jnks.GetJob(id)
		if err != nil {
			log.Errorf("Error on get Job. Error %s ", err)
			return err
		}

		purl, durl := SaveConfigFiles(&jobdt, engine.Name)

		var params = map[string]string{
			"PLATFORM_CONFIG_URL": purl,
			"DEVICE_CONFIG_URL":   durl,
		}

		jid, err := job.InvokeSimple(params)
		if err != nil {
			log.Errorf("Some error triggered while invoking job  %s for engine %s Error %s", id, engine.Name, err)
			continue
		}

		log.Infof("Invoked job with number %d", jid)

		//waiting for job info
		for {
			t, err := jnks.GetQueueItem(jid)
			if err != nil {
				log.Errorf("Some error triggered while invoking queue  %s for engine %s Error %s", id, engine.Name, err)
				continue
			}
			time.Sleep(5 * time.Second)
			log.Debugf("QUEUE  RAW %#+v", t.Raw)
			if len(t.Raw.Why) > 0 {
				log.Infof("Waiting while task in queue:%s", t.Raw.Why)
				time.Sleep(5 * time.Second)
			} else {
				log.Debugf("QUEUE  RAW %#+v", t.Raw)
				bid := t.Raw.Executable.Number

				taskmap[jid] = &config.TaskStatus{
					JobName:    id,
					TaskID:     jid,
					ExecID:     t.Raw.Executable.Number,
					IsFinished: false,
					ExecURL:    t.Raw.Executable.URL,
					Launched:   time.Now(),
					LastUpdate: time.Now(),
				}
				log.Infof("Set Executable %d : %s", bid, t.Raw.Executable.URL)
				break
			}
		}

		//Updating

	}*/

	return nil
}

func Send(subject string, action string, filename string, content *bytes.Buffer) error {

	switch subject {
	case "device":
		return SendDeviceAction(subject, action, filename, content)
	case "product":
		return SendProductAction(subject, action, filename, content)
	case "engine":
		log.Warning("There is not engine jobs, yet")
	default:
		log.Errorf("There is no %s action registered", subject)
	}
	return nil //pending set error
}
