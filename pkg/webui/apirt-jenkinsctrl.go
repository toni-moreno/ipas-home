package webui

import (

	//	"github.com/go-macaron/binding"

	"bytes"

	"bitbucket.org/everis_ipas/ipas-home/pkg/data/jenkins"
	"github.com/go-macaron/binding"

	//	"time"
	macaron "gopkg.in/macaron.v1"
)

// NewAPIRtGitRepo set API for the runtime management
func NewAPIRtJenkins(m *macaron.Macaron) error {

	//	bind := binding.Bind

	m.Group("/api/rt/jenkins", func() {
		m.Post("/build/:subject/:action", reqSignedIn, binding.MultipartForm(CommitFileForm{}), JenkinsSendBuild)
	})
	// subject = device/product/engine/...
	// action  = add / delete / update/...

	return nil
}

func JenkinsSendBuild(ctx *Context, cf CommitFileForm) {

	subject := ctx.Params(":subject")
	action := ctx.Params(":action")

	log.Debugf("Uploaded data :%+v", cf)
	if cf.CommitFile == nil {
		ctx.JSON(404, "Error no file uploaded struct")
		return
	}

	log.Debugf("Uploaded File : %+v", cf)
	for _, f := range cf.CommitFile {

		file, err := f.Open()
		if err != nil {
			log.Warningf("Error on Open Uploaded File: %s", err)
			ctx.JSON(404, err.Error())
			return
		}
		log.Infof("Uploaded File %s", f.Filename)
		buf := new(bytes.Buffer)
		buf.ReadFrom(file)
		s := buf.String()
		log.Debugf("FILE DATA: %s", s)
		err = jenkins.Send(subject, action, f.Filename, buf)
		if err != nil {
			log.Warningf("Error on JOB Execution: %s", err)
			ctx.JSON(404, err.Error())
			return
		}
		ctx.JSON(200, "ok")

	}
}
