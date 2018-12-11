package webui

import (
	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/go-macaron/binding"
	"gopkg.in/macaron.v1"
)

// NewAPICfgPlatformEngines PlatformEngines API REST creator
func NewAPICfgPlatformEngines(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/platformengines", func() {
		m.Get("/", reqSignedIn, GetPlatformEngines)
		m.Post("/", reqSignedIn, bind(config.PlatformEngines{}), AddPlatformEngines)
		m.Put("/:id", reqSignedIn, bind(config.PlatformEngines{}), UpdatePlatformEngines)
		m.Delete("/:id", reqSignedIn, DeletePlatformEngines)
		m.Get("/:id", reqSignedIn, GetPlatformEnginesByID)
		m.Get("/checkondel/:id", reqSignedIn, GetPlatformEnginesAffectOnDel)
	})

	return nil
}

// GetPlatformEngines Return Service Array
func GetPlatformEngines(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetPlatformEnginesArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get Service :%+s", err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

// AddPlatformEngines Insert new service to the internal BBDD --pending--
func AddPlatformEngines(ctx *Context, dev config.PlatformEngines) {
	log.Printf("ADDING Service %+v", dev)
	affected, err := agent.MainConfig.Database.AddPlatformEngines(dev)
	if err != nil {
		log.Warningf("Error on insert new Backend %s  , affected : %+v , error: %s", dev.ID, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		//TODO: review if needed return data  or affected
		ctx.JSON(200, &dev)
	}
}

// UpdatePlatformEngines --pending--
func UpdatePlatformEngines(ctx *Context, dev config.PlatformEngines) {
	id := ctx.Params(":id")
	log.Debugf("Tying to update: %+v", dev)
	affected, err := agent.MainConfig.Database.UpdatePlatformEngines(id, dev)
	if err != nil {
		log.Warningf("Error on update device %s  , affected : %+v , error: %s", dev.ID, affected, err)
	} else {
		//TODO: review if needed return device data
		ctx.JSON(200, &dev)
	}
}

//DeletePlatformEngines --pending--
func DeletePlatformEngines(ctx *Context) {
	id := ctx.Params(":id")
	log.Debugf("Tying to delete: %+v", id)
	affected, err := agent.MainConfig.Database.DelPlatformEngines(id)
	if err != nil {
		log.Warningf("Error on delete influx db %s  , affected : %+v , error: %s", id, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, "deleted")
	}
}

//GetPlatformEnginesByID --pending--
func GetPlatformEnginesByID(ctx *Context) {
	id := ctx.Params(":id")
	dev, err := agent.MainConfig.Database.GetPlatformEnginesByID(id)
	if err != nil {
		log.Warningf("Error on get device db data for device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &dev)
	}
}

// GetPlatformEnginesAffectOnDel --pending--
func GetPlatformEnginesAffectOnDel(ctx *Context) {
	id := ctx.Params(":id")
	obarray, err := agent.MainConfig.Database.GetPlatformEnginesAffectOnDel(id)
	if err != nil {
		log.Warningf("Error on get object array for influx device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &obarray)
	}
}
