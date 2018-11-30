package config

import "fmt"

/***************************
	Service DB backends
	-GetDeviceConfigParamsCfgByID(struct)
	-GetDeviceConfigParamsMap (map - for interna config use
	-GetDeviceConfigParamsArray(Array - for web ui use )
	-AddDeviceConfigParams
	-DelDeviceConfigParams
	-UpdateDeviceConfigParams
  -GetDeviceConfigParamsAffectOnDel
***********************************/

/*GetDeviceConfigParamsByID get device data by id*/
func (dbc *DatabaseCfg) GetDeviceConfigParamsByID(productid string, deviceid string, engineid string, key string) (DeviceConfigParams, error) {
	cfgarray, err := dbc.GetDeviceConfigParamsArray("productid == '" + productid + "' and  deviceid == '" + deviceid + "' and engineid == '" + engineid + "' and  key== '" + key + "'")
	if err != nil {
		return DeviceConfigParams{}, err
	}
	if len(cfgarray) > 1 {
		return DeviceConfigParams{}, fmt.Errorf("Error %d results on get DeviceConfigParams by id %s - %s - %s - %s", len(cfgarray), productid, deviceid, engineid, key)
	}
	if len(cfgarray) == 0 {
		return DeviceConfigParams{}, fmt.Errorf("Error no values have been returned with this id %s - %s - %s - %s in the Services config table", productid, deviceid, engineid, key)
	}
	return *cfgarray[0], nil
}

/*GetDeviceConfigParamsMap  return data in map format*/
func (dbc *DatabaseCfg) GetDeviceConfigParamsMap(filter string) (map[string]*DeviceConfigParams, error) {
	cfgarray, err := dbc.GetDeviceConfigParamsArray(filter)
	cfgmap := make(map[string]*DeviceConfigParams)
	for _, val := range cfgarray {
		cfgmap[val.ProductID] = val
		log.Debugf("%+v", *val)
	}
	return cfgmap, err
}

/*GetDeviceConfigParamsArray generate an array of devices with all its information */
func (dbc *DatabaseCfg) GetDeviceConfigParamsArray(filter string) ([]*DeviceConfigParams, error) {
	var err error
	var devices []*DeviceConfigParams
	//Get Only data for selected devices
	if len(filter) > 0 {
		if err = dbc.x.Where(filter).Find(&devices); err != nil {
			log.Warnf("Fail to get DeviceConfigParams  data filteter with %s : %v\n", filter, err)
			return nil, err
		}
	} else {
		if err = dbc.x.Find(&devices); err != nil {
			log.Warnf("Fail to get influxcfg   data: %v\n", err)
			return nil, err
		}
	}
	return devices, nil
}

/*AddOrUpdateDeviceConfigParams for adding new devices*/
func (dbc *DatabaseCfg) AddOrUpdateDeviceConfigParams(dev DeviceConfigParams) (int64, error) {
	log.Debugf("ADD OR UPDATE %+v", dev)
	//check if exist
	m, err := dbc.GetDeviceConfigParamsArray("productid == '" + dev.ProductID + "' and  deviceid == '" + dev.DeviceID + "' and engineid == '" + dev.EngineID + "' and  key == '" + dev.Key + "'")
	if err != nil {
		return 0, err
	}
	switch len(m) {
	case 1:
		log.Debugf("Updating Config Params %+v", m)
		return dbc.UpdateDeviceConfigParams(dev)
	case 0:
		log.Debugf("Adding new Config Params %+v", dev)
		return dbc.AddDeviceConfigParams(dev)
	default:
		log.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
		return 0, fmt.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
	}
}

/*AddDeviceConfigParams for adding new devices*/
func (dbc *DatabaseCfg) AddDeviceConfigParams(dev DeviceConfigParams) (int64, error) {
	var err error
	var affected int64
	session := dbc.x.NewSession()
	defer session.Close()

	affected, err = session.Insert(dev)
	if err != nil {
		session.Rollback()
		return 0, err
	}
	//no other relation
	err = session.Commit()
	if err != nil {
		return 0, err
	}
	log.Infof("Added new Config Params Successfully with id %s ", dev.ProductID)
	dbc.addChanges(affected)
	return affected, nil
}

/*DelDeviceConfigParams for deleting Services databases from ID*/
func (dbc *DatabaseCfg) DelDeviceConfigParams(productid string, deviceid string, engineid string, key string) (int64, error) {
	var affecteddev, affected int64
	var err error

	session := dbc.x.NewSession()
	defer session.Close()
	// deleting references in HMCCfg

	/*affecteddev, err = session.Where("outdb='" + id + "'").Cols("outdb").Update(&HMCCfg{})
	if err != nil {
		session.Rollback()
		return 0, fmt.Errorf("Error on Delete Service with id on delete HMCCfg with id: %s, error: %s", id, err)
	}*/

	affected, err = session.Where("productid == '" + productid + "' and  deviceid == '" + deviceid + "' engineid == '" + engineid + "' and  key == '" + key + "'").Delete(&DeviceConfigParams{})
	if err != nil {
		session.Rollback()
		return 0, err
	}

	err = session.Commit()
	if err != nil {
		return 0, err
	}
	log.Infof("Deleted Successfully Services db with Product ID: %s Device ID: %s [ %d Services Affected  ]", productid, deviceid, affecteddev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*UpdateDeviceConfigParamsBase for adding new Services from Scanned products , don't change current configurations*/
func (dbc *DatabaseCfg) UpdateDeviceConfigParamsBase(productid string, deviceid string, dev DeviceConfigParams) (int64, error) {
	var affecteddev, affected int64
	var err error
	session := dbc.x.NewSession()
	defer session.Close()

	affected, err = session.Where("productid == '" + productid + "' and  deviceid == '" + deviceid + "'").Update(dev)
	if err != nil {
		session.Rollback()
		return 0, err
	}
	err = session.Commit()
	if err != nil {
		return 0, err
	}

	log.Infof("Updated Service  Base Config Successfully with ProductID %s and DeviceID %s and data:%+v, affected", productid, deviceid, dev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*UpdateDeviceConfigParams for adding new Services*/
func (dbc *DatabaseCfg) UpdateDeviceConfigParams(dev DeviceConfigParams) (int64, error) {
	var affecteddev, affected int64
	var err error
	productid := dev.ProductID
	deviceid := dev.DeviceID
	session := dbc.x.NewSession()
	defer session.Close()

	log.Debugf("Updating Service %#+v", dev)
	affected, err = session.Where("productid == '" + productid + "' and  deviceid == '" + deviceid + "'").UseBool().AllCols().Update(dev)
	if err != nil {
		session.Rollback()
		return 0, err
	}
	err = session.Commit()
	if err != nil {
		return 0, err
	}

	log.Infof("Updated Service Config Successfully with ProductID %s and DeviceID %s and data:%+v, affected", productid, deviceid, dev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*GetDeviceConfigParamsAffectOnDel for deleting devices from ID*/
func (dbc *DatabaseCfg) GetDeviceConfigParamsAffectOnDel(id string) ([]*DbObjAction, error) {
	var obj []*DbObjAction
	/*var devices []*HMCCfg

	if err := dbc.x.Where("outdb='" + id + "'").Find(&devices); err != nil {
		log.Warnf("Error on Get Outout db id %d for devices , error: %s", id, err)
		return nil, err
	}

	for _, val := range devices {
		obj = append(obj, &DbObjAction{
			Type:     "HMCCfg",
			TypeDesc: "HMC Services",
			ObID:     val.ID,
			Action:   "Reset InfluxDB Server from HMC  Service to 'default' InfluxDB Server",
		})

	}*/
	return obj, nil
}
