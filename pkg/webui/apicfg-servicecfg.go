package webui

import (
	//	"time"

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
		m.Post("/ping/", reqSignedIn, bind(config.ServiceCfg{}), PingServiceCfg)
	})

	return nil
}

// GetServiceCfg Return Server Array
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

// AddServiceCfg Insert new measurement groups to de internal BBDD --pending--
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

// PingHTTP get info about url
func PingHTTP(cfg *config.ServiceCfg, log *logrus.Logger, apidbg bool) (time.Duration, string, error) {
	return 0, "", nil
}

// PingService
func PingServiceCfg(ctx *Context, cfg config.ServiceCfg) {
	log.Infof("trying to ping influx server %s : %+v", cfg.ID, cfg)
	elapsed, message, err := PingHTTP(&cfg, log, true)
	type result struct {
		Result  string
		Elapsed time.Duration
		Message string
	}
	if err != nil {
		log.Debugf("ERROR on ping Service : %s", err)
		res := result{Result: "NOOK", Elapsed: elapsed, Message: err.Error()}
		ctx.JSON(400, res)
	} else {
		log.Debugf("OK on ping Service Server %+v, %+v", elapsed, message)
		res := result{Result: "OK", Elapsed: elapsed, Message: message}
		ctx.JSON(200, res)
	}
}
