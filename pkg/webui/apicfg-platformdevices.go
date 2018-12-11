package webui

import (
	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/go-macaron/binding"
	"gopkg.in/macaron.v1"
)

// NewAPICfgPlatformDevices PlatformDevices API REST creator
func NewAPICfgPlatformDevices(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/platformdevices", func() {
		m.Get("/", reqSignedIn, GetPlatformDevices)
		m.Get("/byproduct/:productid", reqSignedIn, GetPlatformDevicesByProduct)
		m.Post("/", reqSignedIn, bind(config.PlatformDevices{}), AddPlatformDevices)
		m.Put("/", reqSignedIn, bind(config.PlatformDevices{}), UpdatePlatformDevices)
		m.Delete("/:productid/:deviceid", reqSignedIn, DeletePlatformDevices)
		m.Get("/:productid/:deviceid", reqSignedIn, GetPlatformDevicesByID)
		m.Get("/checkondel/:id", reqSignedIn, GetPlatformDevicesAffectOnDel)
	})

	return nil
}

// GetPlatformDevices Return Service Array
func GetPlatformDevices(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetPlatformDevicesArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get PlatformDevices :%+s", err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

func GetPlatformDevicesByProduct(ctx *Context) {
	productid := ctx.Params(":productid")
	cfgarray, err := agent.MainConfig.Database.GetPlatformDevicesArray("productid == '" + productid + "'")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get PlatformDevices by product %s Error :%+s", productid, err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

// AddPlatformDevices Insert new service to the internal BBDD --pending--
func AddPlatformDevices(ctx *Context, dev config.PlatformDevices) {
	log.Printf("ADDING Service %+v", dev)
	affected, err := agent.MainConfig.Database.AddPlatformDevices(dev)
	if err != nil {
		log.Warningf("Error on insert new Platform Device for ProductID %s / DeviceID %s  , affected : %+v , error: %s", dev.ProductID, dev.DeviceID, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		//TODO: review if needed return data  or affected
		ctx.JSON(200, &dev)
	}
}

// UpdatePlatformDevices --pending--
func UpdatePlatformDevices(ctx *Context, dev config.PlatformDevices) {
	log.Debugf("Tying to update: %+v", dev)
	affected, err := agent.MainConfig.Database.UpdatePlatformDevices(dev)
	if err != nil {
		log.Warningf("Error on update device PlatformID: %s DeviceID: %s  , affected : %+v , error: %s", dev.ProductID, dev.DeviceID, affected, err)
	} else {
		//TODO: review if needed return device data
		ctx.JSON(200, &dev)
	}
}

//DeletePlatformDevices --pending--
func DeletePlatformDevices(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	log.Debugf("Tying to delete: %s/%s", productid, deviceid)
	affected, err := agent.MainConfig.Database.DelPlatformDevices(productid, deviceid)
	if err != nil {
		log.Warningf("Error on delete Platform device %s/%s  , affected : %+v , error: %s", productid, deviceid, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, "deleted")
	}
}

//GetPlatformDevicesByID --pending--
func GetPlatformDevicesByID(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	dev, err := agent.MainConfig.Database.GetPlatformDevicesByID(productid, deviceid)
	if err != nil {
		log.Warningf("Error on get device  ProductID: %s DeviceID: %s data for device %s  , error: %s", productid, deviceid, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &dev)
	}
}

// GetPlatformDevicesAffectOnDel --pending--
func GetPlatformDevicesAffectOnDel(ctx *Context) {
	id := ctx.Params(":id")
	obarray, err := agent.MainConfig.Database.GetPlatformDevicesAffectOnDel(id)
	if err != nil {
		log.Warningf("Error on get object array for influx device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &obarray)
	}
}
