package webui

import (
	"crypto/tls"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"io/ioutil"
	"net/http"
	"time"

	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"github.com/go-macaron/binding"
	"gopkg.in/macaron.v1"
)

// NewAPICfgService ServiceCfg API REST creator
func NewAPICfgService(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/services", func() {
		m.Get("/", reqSignedIn, GetServiceCfg)
		m.Post("/", reqSignedIn, bind(config.ServiceCfg{}), AddServiceCfg)
		m.Put("/:id", reqSignedIn, bind(config.ServiceCfg{}), UpdateServiceCfg)
		m.Delete("/:id", reqSignedIn, DeleteServiceCfg)
		m.Get("/:id", reqSignedIn, GetServiceCfgByID)
		m.Get("/checkondel/:id", reqSignedIn, GetServiceCfgAffectOnDel)
		m.Get("/ping/", reqSignedIn, PingServiceCfg)
		m.Get("/ping/:id", reqSignedIn, PingServiceCfgByID)
	})

	return nil
}

// GetServiceCfg Return Service Array
func GetServiceCfg(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetServiceCfgArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get Service :%+s", err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

// AddServiceCfg Insert new service to the internal BBDD --pending--
func AddServiceCfg(ctx *Context, dev config.ServiceCfg) {
	log.Printf("ADDING Service %+v", dev)
	affected, err := agent.MainConfig.Database.AddServiceCfg(dev)
	if err != nil {
		log.Warningf("Error on insert new Backend %s  , affected : %+v , error: %s", dev.ID, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		//TODO: review if needed return data  or affected
		ctx.JSON(200, &dev)
	}
}

// UpdateServiceCfg --pending--
func UpdateServiceCfg(ctx *Context, dev config.ServiceCfg) {
	id := ctx.Params(":id")
	log.Debugf("Tying to update: %+v", dev)
	affected, err := agent.MainConfig.Database.UpdateServiceCfg(id, dev)
	if err != nil {
		log.Warningf("Error on update device %s  , affected : %+v , error: %s", dev.ID, affected, err)
	} else {
		//TODO: review if needed return device data
		ctx.JSON(200, &dev)
	}
}

//DeleteServiceCfg --pending--
func DeleteServiceCfg(ctx *Context) {
	id := ctx.Params(":id")
	log.Debugf("Tying to delete: %+v", id)
	affected, err := agent.MainConfig.Database.DelServiceCfg(id)
	if err != nil {
		log.Warningf("Error on delete influx db %s  , affected : %+v , error: %s", id, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, "deleted")
	}
}

//GetServiceCfgByID --pending--
func GetServiceCfgByID(ctx *Context) {
	id := ctx.Params(":id")
	dev, err := agent.MainConfig.Database.GetServiceCfgByID(id)
	if err != nil {
		log.Warningf("Error on get device db data for device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &dev)
	}
}

// GetServiceCfgAffectOnDel --pending--
func GetServiceCfgAffectOnDel(ctx *Context) {
	id := ctx.Params(":id")
	obarray, err := agent.MainConfig.Database.GetServiceCfgAffectOnDel(id)
	if err != nil {
		log.Warningf("Error on get object array for influx device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &obarray)
	}
}

func inArray(val int, arr []string) bool {
	for _, v := range arr {
		log.Debugf("")
		if v == strconv.Itoa(val) {
			return true
		}
	}
	return false
}

// PingHTTP get info about url
func PingHTTP(cfg *config.ServiceCfg, log *logrus.Logger, apidbg bool) (time.Duration, string, error) {
	var resp *http.Response
	var err error
	start := time.Now()
	//Status Mode
	switch cfg.StatusMode {
	case "GET":
		log.Debugf("PING HTTP GET : %s", cfg.ID)

		transCfg := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
		}

		var httpclient = &http.Client{
			Timeout:   time.Second * 30,
			Transport: transCfg,
		}

		resp, err = httpclient.Get(cfg.StatusURL)
		if err != nil {
			elapsed := time.Since(start)
			log.Warnf("Service :%s : ERROR : %s ", cfg.ID, err)
			return elapsed, "ERROR", err
		}
		defer resp.Body.Close()

	default:
		log.Warnf("Unknown status mode %s", cfg.StatusMode)
	}
	//Validation mode
	switch cfg.StatusValidationMode {
	case "statuscode":

		elapsed := time.Since(start)
		if inArray(resp.StatusCode, strings.Split(cfg.StatusValidationValue, ",")) {
			log.Debugf("PING HTTP GET STATUS : %s STATUS OK : %d", cfg.ID, resp.StatusCode)
			return elapsed, "OK", nil
		}
		log.Warnf("PING HTTP GET STATUS : %s STATUS ERROR : %d  not in (%s)", cfg.ID, resp.StatusCode, cfg.StatusValidationValue)
		return elapsed, "ERROR", fmt.Errorf("Got Status %d not in (%s)", resp.StatusCode, cfg.StatusValidationValue)
	case "content":

		body, err := ioutil.ReadAll(resp.Body)
		elapsed := time.Since(start)
		if err != nil {
			log.Warnf("PING HTTP GET STATUS error : %s", err)
			return elapsed, "ERROR", fmt.Errorf("ERROR: %s", err)
		}

		if len(body) > 0 {
			log.Debugf("PING HTTP GET STATUS : %s :%d", cfg.ID, len(body))
			log.Debugf("BODY: %s", body)
			return elapsed, "OK", nil
		}
		log.Warn("PING HTTP GET Body size 0")
		return elapsed, "ERROR", errors.New("ERROR in body: size 0")
	default:
		elapsed := time.Since(start)
		log.Errorf("Unknown Validation Mode %s", cfg.StatusValidationMode)
		return elapsed, "ERROR", fmt.Errorf("Unknown Validation Mode %s", cfg.StatusValidationMode)
	}
	elapsed := time.Since(start)
	return elapsed, "OK", nil
}

// ServiceStatus struct
type ServiceStatus struct {
	Cfg            *config.ServiceCfg
	ServiceStat    string
	ServiceElapsed time.Duration
	ServiceError   string
}

func PingServiceCfgByID(ctx *Context) {
	id := ctx.Params(":id")
	dev, err := agent.MainConfig.Database.GetServiceCfgByID(id)
	log.Infof("trying to ping Service  %s : %+v", dev.ID, &dev)

	elapsed, message, err := PingHTTP(&dev, log, true)
	var ss *ServiceStatus

	if err != nil {
		ss = &ServiceStatus{
			Cfg:            &dev,
			ServiceStat:    message,
			ServiceElapsed: elapsed,
			ServiceError:   err.Error(),
		}
	} else {
		ss = &ServiceStatus{
			Cfg:            &dev,
			ServiceStat:    message,
			ServiceElapsed: elapsed,
		}
	}
	ctx.JSON(200, ss)
}

// PingServiceCfg get status info
func PingServiceCfg(ctx *Context) {

	cfgarray, err := agent.MainConfig.Database.GetServiceCfgArray("")
	if err != nil {
		ctx.JSON(400, err)
		return
	}
	var outputarray []*ServiceStatus

	for _, s := range cfgarray {
		log.Infof("trying to ping Service  %s : %+v", s.ID, s)
		elapsed, message, err := PingHTTP(s, log, true)
		var ss *ServiceStatus
		if err != nil {
			ss = &ServiceStatus{
				Cfg:            s,
				ServiceStat:    message,
				ServiceElapsed: elapsed,
				ServiceError:   err.Error(),
			}
		} else {
			ss = &ServiceStatus{
				Cfg:            s,
				ServiceStat:    message,
				ServiceElapsed: elapsed,
			}
		}

		outputarray = append(outputarray, ss)
	}
	ctx.JSON(200, outputarray)
}
