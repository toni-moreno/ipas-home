package repo

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"

	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing/object"

	"gopkg.in/yaml.v2"
)

var (
	log       *logrus.Logger
	confDir   string              //Needed to get File Filters data
	dbc       *config.DatabaseCfg //Needed to get Custom Filter  data
	repo      *git.Repository
	clonePath string
)

// SetConfDir  enable load File Filters from anywhere in the our FS.
func SetConfDir(dir string) {
	confDir = dir
}

// SetDB load database config to load data if needed (used in filters)
func SetDB(db *config.DatabaseCfg) {
	dbc = db
}

// SetLogger set output log
func SetLogger(l *logrus.Logger) {
	log = l
}

// Init Initialices the Git Repo
func Init(cfgrepo *config.GitRepo) {
	clonePath = cfgrepo.ClonePath
	if _, err := os.Stat(cfgrepo.ClonePath); os.IsNotExist(err) {
		err := os.Mkdir(cfgrepo.ClonePath, 0750)
		if err != nil {
			log.Errorf("Creating Repo Path [ %s ] : %s", cfgrepo.ClonePath, err)
			return
		}
		log.Infof("Creating Repo Path [ %s ]", cfgrepo.ClonePath)
	}

	r, err := git.PlainClone(cfgrepo.ClonePath, false, &git.CloneOptions{
		URL:      cfgrepo.CloneSource,
		Progress: os.Stdout,
	})
	if err != nil {
		log.Errorf("Error on Clone repo %s ", cfgrepo.CloneSource)
		return
	}
	repo = r

	// retrieves the branch pointed by HEAD
	ref, err := repo.Head()
	if err != nil {
		log.Errorf("Error on get HEAD repo ")
		return
	}

	// ... retrieves the commit history
	cIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		log.Errorf("Error on get commit History ")
		return
	}

	// ... just iterates over the commits, printing it
	err = cIter.ForEach(func(c *object.Commit) error {
		log.Debug(c)
		return nil
	})
}

// ProductStat give us the definition stat for this product
type ProductStat struct {
	Name string
	HasG bool
	HasV bool
	HasA bool
}

// EngineConfig get MainConfig this engine
type EngineConfig struct {
	Name        string
	Models      string
	Description string
	Dir         string
	Config      interface{}
	Params      interface{}
}

// Engine a set of configurations related to One Engine or other
type Engine struct {
	Engine string
	Config []EngineConfig
}

// Product State of a product
type Product struct {
	Product     string
	Models      string
	Description string
	Gather      []Engine
	Visual      []Engine
	Alert       []Engine
}

// LoadProductYaml load product data
func LoadProductYaml(yamlfile string) (*Product, error) {
	var product = &Product{}
	data, err := ioutil.ReadFile(yamlfile)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(data, &product)
	if err != nil {
		return nil, err
	}
	return product, nil
}

// GetProductStatus get
func GetProductStatus() ([]*ProductStat, error) {

	var ProductDef []string
	var stat []*ProductStat

	re := regexp.MustCompile(".*/([^/]*)/product.yaml")

	err := filepath.Walk(clonePath+"/products", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("prevent panic by handling failure accessing a path %q: %v", path, err)
			return err
		}
		filearray := re.FindStringSubmatch(path)
		if len(filearray) != 2 {
			return nil
		}

		log.Debugf("Detected Product %s on File %s", filearray[1], filearray[0])

		ProductDef = append(ProductDef, filearray[1])

		var p *Product
		p, err = LoadProductYaml(filearray[0])
		if err != nil {
			log.Errorf("Error on load Product %s file: %s ", filearray[0], err)
			return nil
		}
		//
		ps := &ProductStat{Name: filearray[1]}

		if len(p.Gather) > 0 {
			ps.HasG = true
		}
		if len(p.Alert) > 0 {
			ps.HasA = true
		}
		if len(p.Visual) > 0 {
			ps.HasV = true
		}
		stat = append(stat, ps)
		return nil
	})

	if err != nil {
		fmt.Printf("error walking the path %q: %v\n", clonePath+"/products", err)
		return nil, nil
	}
	return stat, nil
}

// GetProductStatus get
func GetProductDef(id string) (*Product, error) {
	var path = clonePath + "/products/" + id + "/product.yaml"

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("Error on product %s, Err:%s", id, err)
	}

	p, err := LoadProductYaml(path)
	if err != nil {
		log.Errorf("")
		return nil, fmt.Errorf("Error load Product YAML  %s, Err:%s", id, err)
	}
	datajson, err := json.Marshal(p)
	log.Debugf("DATA: %s", datajson)
	return p, nil
}
