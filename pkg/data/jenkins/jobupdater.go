package jenkins

import (
	"time"

	"github.com/toni-moreno/ipas-home/pkg/config"
)

func updateTaskFromID(task *config.TaskStatus) error {
	//waiting for job info

	b, err := jnks.GetBuild(task.JobName, task.ExecID)
	if err != nil {
		log.Errorf("Some error triggered while invoking build  %s -#%d Error %s", task.JobName, task.ExecID, err)
		log.Debugf("JENKINS OBJECT: #+v", jnks)
		return err
	}
	log.Debugf("BUILD : %+v", b.Raw.Building)
	if b.Raw.Building {
		task.IsFinished = false
	} else {
		task.IsFinished = true
		task.Result = b.Raw.Result
	}
	task.LastUpdate = time.Now()

	return nil
}

func updatePlatformDeviceJobs() {
	log.Infof("UpdatePlatformDevices ...")
	devarray, err := dbc.GetPlatformDevicesArray("last_state == 'PENDING'")
	if err != nil {
		log.Errorf("Error on get platform device jobs different than SUCCESS : Err: %s", err)
		return
	}
	log.Infof("Detected %d not SUCCESS platform Devices", len(devarray))
	for _, pdev := range devarray {
		log.Infof("Updating JOB for Platform Device with ProductID %s and DeviceID %s", pdev.ProductID, pdev.DeviceID)
		for k, v := range pdev.TaskStat {
			log.Debugf("Last Task Status for Task %d : %#+v", k, v)
			err := updateTaskFromID(v)
			if err != nil {
				log.Errorf("Can not update tast %d Error :%s", k, err)
			}

		}
		finished := true
		result := "SUCCESS"
		for k, v := range pdev.TaskStat {
			finished = finished && v.IsFinished
			if result == "SUCCESS" && v.Result == "SUCCESS" {
				result = "SUCCESS"
			} else {
				result = "FAILURE"
			}
			log.Debugf("TASK (%d) UPDATE %#+v", k, v)
		}
		if finished {
			if result == "SUCCESS" {
				pdev.LastState = "SUCCESS"
			} else {
				pdev.LastState = "FAILURE"
			}
		} else {
			pdev.LastState = "PENDING"
		}

		dbc.UpdatePlatformDevices(*pdev)
	}
}

func jobUpdater(cfg *config.JenkinsConfig) {
	log.Debugf("JobUpdater. Init...")

	t := time.NewTicker(cfg.UpdateFreq)
	for {
		log.Debugf("jobUpdater. Starting clean process again...")
		updatePlatformDeviceJobs()

	LOOP:
		for {
			select {
			case <-t.C:
				log.Debugf("jobUpdater. tick received...")
				break LOOP
			}
		}
	}
}

func initJobUpdater(cfg *config.JenkinsConfig) {
	go jobUpdater(cfg)

}
