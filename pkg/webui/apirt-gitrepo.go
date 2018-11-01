package webui

import (

	//	"github.com/go-macaron/binding"

	"bytes"
	"mime/multipart"

	"bitbucket.org/everis_ipas/ipas-home/pkg/data/repo"
	"github.com/go-macaron/binding"

	//	"time"
	macaron "gopkg.in/macaron.v1"
)

// UploadForm form struct
type CommitFileForm struct {
	Msg        string                  `form:"Msg"`
	CommitFile []*multipart.FileHeader `form:"CommitFile" binding:"Required"`
}

// NewAPIRtGitRepo set API for the runtime management
func NewAPIRtGitRepo(m *macaron.Macaron) error {

	//	bind := binding.Bind

	m.Group("/api/rt/gitrepo", func() {
		m.Get("/product/" /*reqSignedIn,*/, GitRepoGetProducts)
		m.Get("/product/:id" /*reqSignedIn,*/, GitRepoGetProductByID)
		m.Post("/commitfile" /* reqSignedIn,*/, binding.MultipartForm(CommitFileForm{}), GitRepoCommitFile)
	})

	return nil
}

// GitRepoGetProducts Return Product Array and its GVA state
func GitRepoGetProducts(ctx *Context) {
	status, err := repo.GetProductStatus()
	if err != nil {
		ctx.JSON(404, err.Error())
		log.Errorf("Error on get Service :%+s", err)
		return
	}
	ctx.JSON(200, &status)
	log.Debugf("Getting PRODUCT STATUS %+v", &status)
}

//GitRepoGetProductByID Return de product.yml content
func GitRepoGetProductByID(ctx *Context) {
	id := ctx.Params(":id")
	log.Debugf("Tying to get Product ID %+v", id)
	data, err := repo.GetProductDef(id)
	if err != nil {
		log.Warningf("Error on Get Product Def ID %s ,error: %s", id, err)
		ctx.JSON(404, err.Error())
	} else {
		ctx.JSON(200, &data)
	}
}

func GitRepoCommitFile(ctx *Context, cf CommitFileForm) {

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
		repo.AddFile(f.Filename, buf)

	}
	repo.Commit(cf.Msg)
}
