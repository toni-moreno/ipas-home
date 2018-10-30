package webui

import (
	//	"github.com/go-macaron/binding"

	"bitbucket.org/everis_ipas/ipas-home/pkg/data/repo"

	//	"time"
	macaron "gopkg.in/macaron.v1"
)

// NewAPIRtGitRepo set API for the runtime management
func NewAPIRtGitRepo(m *macaron.Macaron) error {

	//	bind := binding.Bind

	m.Group("/api/rt/gitrepo", func() {
		m.Get("/product/" /*reqSignedIn,*/, GitRepoGetProducts)
		m.Get("/product/:id" /*reqSignedIn,*/, GitRepoGetProductByID)
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
