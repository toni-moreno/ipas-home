package webui

import (
	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/go-macaron/binding"
	"gopkg.in/macaron.v1"
)

// NewAPICfgProductDBMap ProductDBMap API REST creator
func NewAPICfgProductDBMap(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/productdbmap", func() {
		m.Get("/", reqSignedIn, GetProductDBMap)
		m.Post("/", reqSignedIn, bind(config.ProductDBMap{}), AddProductDBMap)
		m.Put("/:id", bind(config.ProductDBMap{}), UpdateProductDBMap)
		m.Delete("/:id", reqSignedIn, DeleteProductDBMap)
		m.Get("/:id", reqSignedIn, GetProductDBMapByID)
		m.Get("/checkondel/:id", reqSignedIn, GetProductDBMapAffectOnDel)
	})

	return nil
}

// GetProductDBMap Return Service Array
func GetProductDBMap(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetProductDBMapArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get Service :%+s", err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

// AddProductDBMap Insert new service to the internal BBDD --pending--
func AddProductDBMap(ctx *Context, dev config.ProductDBMap) {
	log.Printf("ADDING Service %+v", dev)
	affected, err := agent.MainConfig.Database.AddProductDBMap(dev)
	if err != nil {
		log.Warningf("Error on insert new Backend %s  , affected : %+v , error: %s", dev.ID, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		//TODO: review if needed return data  or affected
		ctx.JSON(200, &dev)
	}
}

// UpdateProductDBMap --pending--
func UpdateProductDBMap(ctx *Context, dev config.ProductDBMap) {
	id := ctx.Params(":id")
	log.Debugf("Tying to update: %+v", dev)
	affected, err := agent.MainConfig.Database.UpdateProductDBMap(id, dev)
	if err != nil {
		log.Warningf("Error on update device %s  , affected : %+v , error: %s", dev.ID, affected, err)
	} else {
		//TODO: review if needed return device data
		ctx.JSON(200, &dev)
	}
}

//DeleteProductDBMap --pending--
func DeleteProductDBMap(ctx *Context) {
	id := ctx.Params(":id")
	log.Debugf("Tying to delete: %+v", id)
	affected, err := agent.MainConfig.Database.DelProductDBMap(id)
	if err != nil {
		log.Warningf("Error on delete influx db %s  , affected : %+v , error: %s", id, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, "deleted")
	}
}

//GetProductDBMapByID --pending--
func GetProductDBMapByID(ctx *Context) {
	id := ctx.Params(":id")
	dev, err := agent.MainConfig.Database.GetProductDBMapByID(id)
	if err != nil {
		log.Warningf("Error on get device db data for device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &dev)
	}
}

// GetProductDBMapAffectOnDel --pending--
func GetProductDBMapAffectOnDel(ctx *Context) {
	id := ctx.Params(":id")
	obarray, err := agent.MainConfig.Database.GetProductDBMapAffectOnDel(id)
	if err != nil {
		log.Warningf("Error on get object array for influx device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &obarray)
	}
}
