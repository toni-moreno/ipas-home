package config

import "fmt"

/***************************
	Service DB backends
	-GetPlatformDevicesCfgByID(struct)
	-GetPlatformDevicesMap (map - for interna config use
	-GetPlatformDevicesArray(Array - for web ui use )
	-AddPlatformDevices
	-DelPlatformDevices
	-UpdatePlatformDevices
  -GetPlatformDevicesAffectOnDel
***********************************/

/*GetPlatformDevicesByID get device data by id*/
func (dbc *DatabaseCfg) GetPlatformDevicesByID(productid string, deviceid string) (PlatformDevices, error) {
	cfgarray, err := dbc.GetPlatformDevicesArray("productid == '" + productid + "' and  deviceid == '" + deviceid + "'")
	if err != nil {
		return PlatformDevices{}, err
	}
	if len(cfgarray) > 1 {
		return PlatformDevices{}, fmt.Errorf("Error %d results on get PlatformDevices by id %s - %s", len(cfgarray), productid, deviceid)
	}
	if len(cfgarray) == 0 {
		return PlatformDevices{}, fmt.Errorf("Error no values have been returned with this id %s - %s in the Services config table", productid, deviceid)
	}
	return *cfgarray[0], nil
}

/*GetPlatformDevicesMap  return data in map format*/
func (dbc *DatabaseCfg) GetPlatformDevicesMap(filter string) (map[string]*PlatformDevices, error) {
	cfgarray, err := dbc.GetPlatformDevicesArray(filter)
	cfgmap := make(map[string]*PlatformDevices)
	for _, val := range cfgarray {
		cfgmap[val.ProductID] = val
		log.Debugf("%+v", *val)
	}
	return cfgmap, err
}

/*GetPlatformDevicesArray generate an array of devices with all its information */
func (dbc *DatabaseCfg) GetPlatformDevicesArray(filter string) ([]*PlatformDevices, error) {
	var err error
	var devices []*PlatformDevices
	//Get Only data for selected devices
	if len(filter) > 0 {
		if err = dbc.x.Where(filter).Find(&devices); err != nil {
			log.Warnf("Fail to get PlatformDevices  data filteter with %s : %v\n", filter, err)
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

/*AddOrUpdatePlatformDevices for adding new devices*/
func (dbc *DatabaseCfg) AddOrUpdatePlatformDevices(dev PlatformDevices) (int64, error) {
	log.Debugf("ADD OR UPDATE %+v", dev)
	//check if exist
	m, err := dbc.GetPlatformDevicesArray("productid == '" + dev.ProductID + "' and  deviceid == '" + dev.DeviceID + "'")
	if err != nil {
		return 0, err
	}
	switch len(m) {
	case 1:
		log.Debugf("Updating Device %+v", m)
		return dbc.UpdatePlatformDevices(dev)
	case 0:
		log.Debugf("Adding new Device %+v", dev)
		return dbc.AddPlatformDevices(dev)
	default:
		log.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
		return 0, fmt.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
	}
}

/*AddPlatformDevices for adding new devices*/
func (dbc *DatabaseCfg) AddPlatformDevices(dev PlatformDevices) (int64, error) {
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
	log.Infof("Added new Services backend Successfully with id %s ", dev.ProductID)
	dbc.addChanges(affected)
	return affected, nil
}

/*DelPlatformDevices for deleting Services databases from ID*/
func (dbc *DatabaseCfg) DelPlatformDevices(productid string, deviceid string) (int64, error) {
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

	affected, err = session.Where("productid == '" + productid + "' and  deviceid == '" + deviceid + "'").Delete(&PlatformDevices{})
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

/*UpdatePlatformDevicesBase for adding new Services from Scanned products , don't change current configurations*/
func (dbc *DatabaseCfg) UpdatePlatformDevicesBase(productid string, deviceid string, dev PlatformDevices) (int64, error) {
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

/*UpdatePlatformDevices for adding new Services*/
func (dbc *DatabaseCfg) UpdatePlatformDevices(dev PlatformDevices) (int64, error) {
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

/*GetPlatformDevicesAffectOnDel for deleting devices from ID*/
func (dbc *DatabaseCfg) GetPlatformDevicesAffectOnDel(id string) ([]*DbObjAction, error) {
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
