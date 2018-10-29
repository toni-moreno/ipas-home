package config

import "fmt"

/***************************
	Service DB backends
	-GetServiceCfgCfgByID(struct)
	-GetServiceCfgMap (map - for interna config use
	-GetServiceCfgArray(Array - for web ui use )
	-AddServiceCfg
	-DelServiceCfg
	-UpdateServiceCfg
  -GetServiceCfgAffectOnDel
***********************************/

/*GetServiceCfgByID get device data by id*/
func (dbc *DatabaseCfg) GetServiceCfgByID(id string) (ServiceCfg, error) {
	cfgarray, err := dbc.GetServiceCfgArray("id='" + id + "'")
	if err != nil {
		return ServiceCfg{}, err
	}
	if len(cfgarray) > 1 {
		return ServiceCfg{}, fmt.Errorf("Error %d results on get ServiceCfg by id %s", len(cfgarray), id)
	}
	if len(cfgarray) == 0 {
		return ServiceCfg{}, fmt.Errorf("Error no values have been returned with this id %s in the Services config table", id)
	}
	return *cfgarray[0], nil
}

/*GetServiceCfgMap  return data in map format*/
func (dbc *DatabaseCfg) GetServiceCfgMap(filter string) (map[string]*ServiceCfg, error) {
	cfgarray, err := dbc.GetServiceCfgArray(filter)
	cfgmap := make(map[string]*ServiceCfg)
	for _, val := range cfgarray {
		cfgmap[val.ID] = val
		log.Debugf("%+v", *val)
	}
	return cfgmap, err
}

/*GetServiceCfgArray generate an array of devices with all its information */
func (dbc *DatabaseCfg) GetServiceCfgArray(filter string) ([]*ServiceCfg, error) {
	var err error
	var devices []*ServiceCfg
	//Get Only data for selected devices
	if len(filter) > 0 {
		if err = dbc.x.Where(filter).Find(&devices); err != nil {
			log.Warnf("Fail to get ServiceCfg  data filteter with %s : %v\n", filter, err)
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

/*AddServiceCfg for adding new devices*/
func (dbc *DatabaseCfg) AddServiceCfg(dev ServiceCfg) (int64, error) {
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

/*DelServiceCfg for deleting Services databases from ID*/
func (dbc *DatabaseCfg) DelServiceCfg(id string) (int64, error) {
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

	affected, err = session.Where("id='" + id + "'").Delete(&ServiceCfg{})
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

/*/ AddOrUpdateServiceCfg this method insert data if not previouosly exist the tuple ifxServer.Name or update it if already exist
func (dbc *DatabaseCfg) AddOrUpdateServiceCfg(dev *ServiceCfg) (int64, error) {
	log.Debugf("ADD OR UPDATE %+v", dev)
	//check if exist
	m, err := dbc.GetServiceCfgArray("id == '" + dev.ID + "'")
	if err != nil {
		return 0, err
	}
	switch len(m) {
	case 1:
		log.Debugf("Updating Service ID[%s] %#+v", m[0].ID, dev)
		return dbc.UpdateServiceCfgBase(m[0].ID, *dev)
	case 0:
		dev.EnableHMCStats = true
		dev.EnableNmonStats = true
		log.Debugf("Adding new Service ID[%s] %#+v", dev.ID, dev)
		return dbc.AddServiceCfg(*dev)
	default:
		log.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
		return 0, fmt.Errorf("There is some error when searching for db %+v , found %d", dev, len(m))
	}

}*/

/*UpdateServiceCfgBase for adding new Services from Scanned products , don't change current configurations*/
func (dbc *DatabaseCfg) UpdateServiceCfgBase(id string, dev ServiceCfg) (int64, error) {
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

/*UpdateServiceCfg for adding new Services*/
func (dbc *DatabaseCfg) UpdateServiceCfg(id string, dev ServiceCfg) (int64, error) {
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

/*GetServiceCfgAffectOnDel for deleting devices from ID*/
func (dbc *DatabaseCfg) GetServiceCfgAffectOnDel(id string) ([]*DbObjAction, error) {
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
