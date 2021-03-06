package config

import "fmt"

/***************************
	Service DB backends
	-GetPlatformEnginesCfgByID(struct)
	-GetPlatformEnginesMap (map - for interna config use
	-GetPlatformEnginesArray(Array - for web ui use )
	-AddPlatformEngines
	-DelPlatformEngines
	-UpdatePlatformEngines
  -GetPlatformEnginesAffectOnDel
***********************************/

/*GetPlatformEnginesByID get device data by id*/
func (dbc *DatabaseCfg) GetPlatformEnginesByID(id string) (PlatformEngines, error) {
	cfgarray, err := dbc.GetPlatformEnginesArray("id='" + id + "'")
	if err != nil {
		return PlatformEngines{}, err
	}
	if len(cfgarray) > 1 {
		return PlatformEngines{}, fmt.Errorf("Error %d results on get PlatformEngines by id %s", len(cfgarray), id)
	}
	if len(cfgarray) == 0 {
		return PlatformEngines{}, fmt.Errorf("Error no values have been returned with this id %s in the Services config table", id)
	}
	return *cfgarray[0], nil
}

/*GetPlatformEnginesMap  return data in map format*/
func (dbc *DatabaseCfg) GetPlatformEnginesMap(filter string) (map[string]*PlatformEngines, error) {
	cfgarray, err := dbc.GetPlatformEnginesArray(filter)
	cfgmap := make(map[string]*PlatformEngines)
	for _, val := range cfgarray {
		cfgmap[val.ID] = val
		log.Debugf("%+v", *val)
	}
	return cfgmap, err
}

/*GetPlatformEnginesArray generate an array of devices with all its information */
func (dbc *DatabaseCfg) GetPlatformEnginesArray(filter string) ([]*PlatformEngines, error) {
	var err error
	var devices []*PlatformEngines
	//Get Only data for selected devices
	if len(filter) > 0 {
		if err = dbc.x.Where(filter).Find(&devices); err != nil {
			log.Warnf("Fail to get PlatformEngines  data filteter with %s : %v\n", filter, err)
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

/*AddPlatformEngines for adding new devices*/
func (dbc *DatabaseCfg) AddPlatformEngines(dev PlatformEngines) (int64, error) {
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
	log.Infof("Added new Services backend Successfully with id %s ", dev.ID)
	dbc.addChanges(affected)
	return affected, nil
}

/*DelPlatformEngines for deleting Services databases from ID*/
func (dbc *DatabaseCfg) DelPlatformEngines(id string) (int64, error) {
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

	affected, err = session.Where("id='" + id + "'").Delete(&PlatformEngines{})
	if err != nil {
		session.Rollback()
		return 0, err
	}

	err = session.Commit()
	if err != nil {
		return 0, err
	}
	log.Infof("Deleted Successfully Services db with ID %s [ %d Services Affected  ]", id, affecteddev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*UpdatePlatformEnginesBase for adding new Services from Scanned products , don't change current configurations*/
func (dbc *DatabaseCfg) UpdatePlatformEnginesBase(id string, dev PlatformEngines) (int64, error) {
	var affecteddev, affected int64
	var err error
	session := dbc.x.NewSession()
	defer session.Close()

	affected, err = session.Where("id='" + id + "'").Update(dev)
	if err != nil {
		session.Rollback()
		return 0, err
	}
	err = session.Commit()
	if err != nil {
		return 0, err
	}

	log.Infof("Updated Service  Base Config Successfully with id %s and data:%+v, affected", id, dev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*UpdatePlatformEngines for adding new Services*/
func (dbc *DatabaseCfg) UpdatePlatformEngines(id string, dev PlatformEngines) (int64, error) {
	var affecteddev, affected int64
	var err error
	session := dbc.x.NewSession()
	defer session.Close()
	/*if id != dev.ID { //ID has been changed
		affecteddev, err = session.Where("outdb='" + id + "'").Cols("outdb").Update(&HMCCfg{OutDB: dev.ID})
		if err != nil {
			session.Rollback()
			return 0, fmt.Errorf("Error on Update InfluxConfig on update id(old)  %s with (new): %s, error: %s", id, dev.ID, err)
		}
		log.Infof("Updated Service Config to %s devices ", affecteddev)
	}*/
	log.Debugf("Updating Service %#+v", dev)
	affected, err = session.Where("id='" + id + "'").UseBool().AllCols().Update(dev)
	if err != nil {
		session.Rollback()
		return 0, err
	}
	err = session.Commit()
	if err != nil {
		return 0, err
	}

	log.Infof("Updated Service Config Successfully with id %s and data:%+v, affected", id, dev)
	dbc.addChanges(affected + affecteddev)
	return affected, nil
}

/*GetPlatformEnginesAffectOnDel for deleting devices from ID*/
func (dbc *DatabaseCfg) GetPlatformEnginesAffectOnDel(id string) ([]*DbObjAction, error) {
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
