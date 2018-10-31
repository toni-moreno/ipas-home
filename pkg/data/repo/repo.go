package repo

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"reflect"
	"regexp"

	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/object"

	//	"gopkg.in/yaml.v2"
	//https://github.com/go-yaml/yaml/issues/139
	"gopkg.in/mikefarah/yaml.v2"
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

	//https://github.com/go-yaml/yaml/issues/139
	yaml.DefaultMapType = reflect.TypeOf(map[string]interface{}{})

	clonePath = cfgrepo.ClonePath
	if _, err := os.Stat(cfgrepo.ClonePath); os.IsNotExist(err) {
		err := os.Mkdir(cfgrepo.ClonePath, 0750)
		if err != nil {
			log.Errorf("Creating Repo Path [ %s ] : %s", cfgrepo.ClonePath, err)
			return
		}
		log.Infof("Creating Repo Path [ %s ]", cfgrepo.ClonePath)
	}

	var r *git.Repository
	var err error

	// first try to get if exist
	r, err = git.PlainOpen(cfgrepo.ClonePath)
	if err != nil {
		//if not we will clone from source
		log.Errorf("Error on Open Existing repo %s: Error: %s ", cfgrepo.ClonePath, err)

		r, err = git.PlainClone(cfgrepo.ClonePath, false, &git.CloneOptions{
			URL:      cfgrepo.CloneSource,
			Progress: os.Stdout,
		})
		if err != nil {
			log.Errorf("Error on Clone repo %s: Error: %s ", cfgrepo.CloneSource, err)
			return
		}
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

	// checkout to the working branch

	if cfgrepo.WorkOnBranch != "master" {
		w, err := r.Worktree()
		if err != nil {
			log.Errorf("Error on get Repo WorkTree")
			return
		}

		branch := fmt.Sprintf("refs/heads/%s", cfgrepo.WorkOnBranch)
		//first  checkout
		err = w.Checkout(&git.CheckoutOptions{
			//		Hash:   ref.Hash(),
			Branch: plumbing.ReferenceName(branch),
			Create: false,
			Force:  false,
		})
		if err != nil {
			log.Warnf("Can not change to brach %s, Error: %s", cfgrepo.WorkOnBranch, err)
			err = w.Checkout(&git.CheckoutOptions{
				//		Hash:   ref.Hash(),
				Branch: plumbing.ReferenceName(branch),
				Create: true,
				Force:  false,
			})
			log.Infof("Successfully created Brach:  %s", cfgrepo.WorkOnBranch)
		}
		log.Infof("Successfully changed to Brach: %s", cfgrepo.WorkOnBranch)
	}
}

// ProductStat give us the definition stat for this product
type ProductStat struct {
	Name  string
	HasDB bool
	HasG  bool
	HasV  bool
	HasA  bool
}

// EngineConfig get MainConfig this engine
type EngineConfig struct {
	Name        string      `yaml:"name"`
	Models      string      `yaml:"models"`
	Description string      `yaml:"description"`
	Dir         string      `yaml:"dir"`
	Config      interface{} `yaml:"config"`
	Params      interface{} `yaml:"params"`
}

// Engine a set of configurations related to One Engine or other
type Engine struct {
	Engine string         `yaml:"engine"`
	Config []EngineConfig `yaml:"config"`
}

// Product State of a product
type Product struct {
	Product     string   `yaml:"product"`
	Models      string   `yaml:"models"`
	Description string   `yaml:"description"`
	Gather      []Engine `yaml:"gather"`
	Visual      []Engine `yaml:"visual"`
	Alert       []Engine `yaml:"alert"`
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

		_, err = dbc.GetProductDBMapByID(ps.Name)
		if err != nil {
			log.Warningf("Error on get DB map for proudct %s  , error: %s", ps.Name, err)
			ps.HasDB = false
		} else {
			ps.HasDB = true
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

	return p, nil
}
