package webui

import (
	//	"github.com/go-macaron/binding"
	"bitbucket.org/everis_ipas/ipas-home/pkg/agent"
	//	"time"
	macaron "gopkg.in/macaron.v1"
)

// NewAPIRtAgent set API for the runtime management
func NewAPIRtAgent(m *macaron.Macaron) error {

	//	bind := binding.Bind

	m.Group("/api/rt/agent", func() {
		m.Get("/info/version/", reqSignedIn, RTGetVersion)
		m.Get("/reload/", reqSignedIn, AgentReloadConf)
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
