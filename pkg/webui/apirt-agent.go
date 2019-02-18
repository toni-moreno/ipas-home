package webui

import (
	//	"github.com/go-macaron/binding"
	"os"
	"path/filepath"

	"github.com/toni-moreno/ipas-home/pkg/agent"
	"github.com/toni-moreno/ipas-home/pkg/login"
	//	"time"
	macaron "gopkg.in/macaron.v1"
)

// NewAPIRtAgent set API for the runtime management
func NewAPIRtAgent(m *macaron.Macaron) error {

	//	bind := binding.Bind

	m.Group("/api/rt/agent", func() {
		m.Get("/info/version/", login.ReqSignedIn, RTGetVersion)
		m.Get("/reload/", login.ReqSignedIn, AgentReloadConf)
		m.Get("/download/:id" /*, login.ReqSignedIn*/, AgentDownloadFile)
	})

	return nil
}

//RTGetVersion xx
func RTGetVersion(ctx *Context) {
	info := agent.GetRInfo()
	ctx.JSON(200, &info)
}

// AgentReloadConf xx
func AgentReloadConf(ctx *Context) {
	log.Info("trying to reload configuration for all devices")
	time, err := agent.ReloadConf()
	if err != nil {
		ctx.JSON(405, err.Error())
		return
	}
	ctx.JSON(200, time)
}

// AgentDownloadFile xx
func AgentDownloadFile(ctx *Context) {
	log.Info("trying to reload configuration for all devices")
	file := ctx.Params(":id")
	path := filepath.Clean(downloadDir + "/" + file)
	//avoid certain paths

	if _, err := os.Stat(path); os.IsNotExist(err) {
		// path/to/whatever does not exist
		ctx.JSON(404, err.Error())
		return
	}
	ctx.ServeFile(path)
}
