package webui

import (
	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/go-macaron/binding"
	"gopkg.in/macaron.v1"
)

// NewAPICfgDeviceConfigParams DeviceConfigParams API REST creator
func NewAPICfgDeviceConfigParams(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/deviceconfigparams", func() {
		m.Get("/" /*reqSignedIn,*/, GetDeviceConfigParams)
		m.Get("/byproduct/:productid" /*reqSignedIn,*/, GetDeviceConfigParamsByProduct)
		m.Get("/bydevice/:productid/:deviceid" /*reqSignedIn,*/, GetDeviceConfigParamsByDevice)
		m.Post("/" /*reqSignedIn,*/, bind(config.DeviceConfigParams{}), AddDeviceConfigParams)
		m.Put("/" /* reqSignedIn,*/, bind(config.DeviceConfigParams{}), UpdateDeviceConfigParams)
		m.Delete("/:productid/:deviceid/:engineid/:key" /* reqSignedIn,*/, DeleteDeviceConfigParams)
		m.Get("/:productid/:deviceid/:engineid/:key" /*reqSignedIn,*/, GetDeviceConfigParamsByID)
		m.Get("/checkondel/:id" /*reqSignedIn,*/, GetDeviceConfigParamsAffectOnDel)
	})

	return nil
}

// GetDeviceConfigParams Return Service Array
func GetDeviceConfigParams(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams :%+s", err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

func GetDeviceConfigParamsByProduct(ctx *Context) {
	productid := ctx.Params(":productid")
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("productid == '" + productid + "'")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams by product %s Error :%+s", productid, err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

func GetDeviceConfigParamsByDevice(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("productid == '" + productid + "' and deviceid == '" + deviceid + "'")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams by device %s/%s %s Error :%+s", productid, deviceid, err)
		return
	}
	ctx.JSON(200, &cfgarray)
	log.Debugf("Getting DEVICEs %+v", &cfgarray)
}

// AddDeviceConfigParams Insert new service to the internal BBDD --pending--
func AddDeviceConfigParams(ctx *Context, dev config.DeviceConfigParams) {
	log.Printf("ADDING Service %+v", dev)
	affected, err := agent.MainConfig.Database.AddDeviceConfigParams(dev)
	if err != nil {
		log.Warningf("Error on insert new Platform Device for ProductID %s / DeviceID %s  , affected : %+v , error: %s", dev.ProductID, dev.DeviceID, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		//TODO: review if needed return data  or affected
		ctx.JSON(200, &dev)
	}
}

// UpdateDeviceConfigParams --pending--
func UpdateDeviceConfigParams(ctx *Context, dev config.DeviceConfigParams) {
	log.Debugf("Tying to update: %+v", dev)
	affected, err := agent.MainConfig.Database.UpdateDeviceConfigParams(dev)
	if err != nil {
		log.Warningf("Error on update device PlatformID: %s DeviceID: %s  , affected : %+v , error: %s", dev.ProductID, dev.DeviceID, affected, err)
	} else {
		//TODO: review if needed return device data
		ctx.JSON(200, &dev)
	}
}

//DeleteDeviceConfigParams --pending--
func DeleteDeviceConfigParams(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	engineid := ctx.Params(":engineid")
	key := ctx.Params(":key")
	log.Debugf("Tying to delete: %s/%s/%s/%s", productid, deviceid, engineid, key)
	affected, err := agent.MainConfig.Database.DelDeviceConfigParams(productid, deviceid, engineid, key)
	if err != nil {
		log.Warningf("Error on delete Platform device %s/%s/%s/%s  , affected : %+v , error: %s", productid, deviceid, engineid, key, affected, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, "deleted")
	}
}

//GetDeviceConfigParamsByID --pending--
func GetDeviceConfigParamsByID(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	engineid := ctx.Params(":engineid")
	key := ctx.Params(":key")
	dev, err := agent.MainConfig.Database.GetDeviceConfigParamsByID(productid, deviceid, engineid, key)
	if err != nil {
		log.Warningf("Error on get device  ProductID: %s DeviceID: %s Engind: %s Key:%s  , error: %s", productid, deviceid, engineid, key, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &dev)
	}
}

// GetDeviceConfigParamsAffectOnDel --pending--
func GetDeviceConfigParamsAffectOnDel(ctx *Context) {
	id := ctx.Params(":id")
	obarray, err := agent.MainConfig.Database.GetDeviceConfigParamsAffectOnDel(id)
	if err != nil {
		log.Warningf("Error on get object array for influx device %s  , error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &obarray)
	}
}
