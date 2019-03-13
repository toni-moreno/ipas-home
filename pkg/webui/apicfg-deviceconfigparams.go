package webui

import (
	"encoding/json"

	"github.com/go-macaron/binding"
	"github.com/toni-moreno/ipas-home/pkg/agent"
	"github.com/toni-moreno/ipas-home/pkg/config"
	"github.com/toni-moreno/ipas-home/pkg/login"
	"gopkg.in/macaron.v1"
)

// NewAPICfgDeviceConfigParams DeviceConfigParams API REST creator
func NewAPICfgDeviceConfigParams(m *macaron.Macaron) error {

	bind := binding.Bind

	m.Group("/api/cfg/deviceconfigparams", func() {
		m.Get("/", login.ReqSignedIn, GetDeviceConfigParams)
		m.Get("/byproduct/:productid", login.ReqSignedIn, GetDeviceConfigParamsByProduct)
		m.Get("/bydevice/:productid/:deviceid", login.ReqSignedIn, GetDeviceConfigParamsByDevice)
		m.Post("/", login.ReqSignedIn, bind(config.DeviceConfigParams{}), AddDeviceConfigParams)
		m.Put("/", login.ReqSignedIn, bind(config.DeviceConfigParams{}), UpdateDeviceConfigParams)
		m.Delete("/:productid/:deviceid/:engineid/:configid/:key", login.ReqSignedIn, DeleteDeviceConfigParams)
		m.Get("/:productid/:deviceid/:engineid/:configid/:key", login.ReqSignedIn, GetDeviceConfigParamsByID)
		m.Get("/checkondel/:id", login.ReqSignedIn, GetDeviceConfigParamsAffectOnDel)
	})

	return nil
}

// DeviceConfigParams parameters for each
type DeviceParamsTranx struct {
	ProductID string
	DeviceID  string
	EngineID  string
	ConfigID  string
	Key       string
	Value     interface{}
}

func transformArrayParams(array []*config.DeviceConfigParams) []*DeviceParamsTranx {
	var out []*DeviceParamsTranx
	for _, el := range array {
		dt := DeviceParamsTranx{
			ProductID: el.ProductID,
			DeviceID:  el.DeviceID,
			EngineID:  el.EngineID,
			ConfigID:  el.ConfigID,
			Key:       el.Key,
		}
		err := json.Unmarshal([]byte(el.Value), &dt.Value)
		if err != nil {
			log.Warnf("Can not Unmarshall for key %s value %s: Error: %s", el.Key, el.Value, err)
			continue
		}
		out = append(out, &dt)
	}
	return out
}

// GetDeviceConfigParams Return Service Array
func GetDeviceConfigParams(ctx *Context) {
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams :%+s", err)
		return
	}
	tp := transformArrayParams(cfgarray)
	ctx.JSON(200, &tp)
	log.Debugf("Getting DEVICEs %+v", &tp)
}

func GetDeviceConfigParamsByProduct(ctx *Context) {
	productid := ctx.Params(":productid")
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("productid == '" + productid + "'")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams by product %s Error :%+s", productid, err)
		return
	}
	tp := transformArrayParams(cfgarray)
	ctx.JSON(200, &tp)
	log.Debugf("Getting DEVICEs %+v", &tp)
}

func GetDeviceConfigParamsByDevice(ctx *Context) {
	productid := ctx.Params(":productid")
	deviceid := ctx.Params(":deviceid")
	cfgarray, err := agent.MainConfig.Database.GetDeviceConfigParamsArray("productid == '" + productid + "' and deviceid == '" + deviceid + "'")
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get DeviceConfigParams by device %s/%s Error :%+s", productid, deviceid, err)
		return
	}
	tp := transformArrayParams(cfgarray)
	ctx.JSON(200, &tp)
	log.Debugf("Getting DEVICEs %+v", &tp)
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
	configid := ctx.Params(":configid")
	key := ctx.Params(":key")
	log.Debugf("Tying to delete: %s/%s/%s/%s/%s", productid, deviceid, engineid, configid, key)
	affected, err := agent.MainConfig.Database.DelDeviceConfigParams(productid, deviceid, engineid, configid, key)
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
	configid := ctx.Params(":configid")
	key := ctx.Params(":key")
	dev, err := agent.MainConfig.Database.GetDeviceConfigParamsByID(productid, deviceid, engineid, configid, key)
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
