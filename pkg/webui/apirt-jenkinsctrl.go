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
		m.Post("/build/:id" /* reqSignedIn,*/, binding.MultipartForm(CommitFileForm{}), JenkinsSendBuild)
	})

	return nil
}

func JenkinsSendBuild(ctx *Context, cf CommitFileForm) {

	id := ctx.Params(":id")

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
		log.Debug("FILE DATA: %s", s)
		jid, err := jenkins.Send(id, f.Filename, buf)
		if err != nil {
			log.Warningf("Error on JOB Execution: %s", err)
			ctx.JSON(404, err.Error())
			return
		}
		ctx.JSON(200, jid)

	}
}
