package repo

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"strings"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/toni-moreno/ipas-home/pkg/config"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
	"gopkg.in/src-d/go-git.v4/plumbing/transport/client"
	githttp "gopkg.in/src-d/go-git.v4/plumbing/transport/http"

	//	"gopkg.in/yaml.v2"
	//https://github.com/go-yaml/yaml/issues/139
	"gopkg.in/mikefarah/yaml.v2"
)

var (
	log       *logrus.Logger
	confDir   string              //Needed to get File Filters data
	dbc       *config.DatabaseCfg //Needed to get Custom Filter  data
	repo      *git.Repository
	wtree     *git.Worktree
	clonePath string
	gitName   string
	gitEmail  string
	gitBranch string
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

func GetHistory() []*object.Commit {

	harray := []*object.Commit{}
	// ... retrieves the commit history

	ref, err := repo.Head()
	if err != nil {
		log.Errorf("Error on get HEAD repo: %s ", err)
		return nil
	}

	cIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		log.Errorf("Error on get commit History %s", err)
		return nil
	}

	// ... just iterates over the commits, printing it
	err = cIter.ForEach(func(c *object.Commit) error {
		harray = append(harray, c)
		log.Debug(c)
		return nil
	})
	return harray
}

// Init Initialices the Git Repo
func Init(cfgrepo *config.GitRepo) {

	//https://github.com/go-yaml/yaml/issues/139
	yaml.DefaultMapType = reflect.TypeOf(map[string]interface{}{})

	clonePath = cfgrepo.ClonePath
	gitName = cfgrepo.Name
	gitEmail = cfgrepo.Email

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

	URL, err := url.Parse(cfgrepo.CloneSource)
	if err != nil {
		log.Errorf("Error on Git Clone Path ERR: %s", err)
		return
	}
	if URL.Scheme == "https" {
		log.Info("Detected HTTPS scheme on repo %s ", cfgrepo.CloneSource)
		// Clustom https
		customClient := &http.Client{
			// accept any certificate (might be useful for testing)
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			},

			// 15 second timeout
			Timeout: 15 * time.Second,

			// don't follow redirect
			/*CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			}*/
		}
		client.InstallProtocol("https", githttp.NewClient(customClient))
	}

	// first try to get if exist
	r, err = git.PlainOpen(cfgrepo.ClonePath)
	if err != nil {
		//if not we will clone from source
		log.Warnf("Can not Open dir %s as a valid Git REPO: Error: %s ", cfgrepo.ClonePath, err)

		r, err = git.PlainClone(cfgrepo.ClonePath, false, &git.CloneOptions{
			URL:      cfgrepo.CloneSource,
			Progress: os.Stdout,
		})
		if err != nil {
			log.Errorf("Error on Clone repo %s: Error: %s ", cfgrepo.CloneSource, err)
			return
		}
		log.Infof("REPO %s successfully cloned ", cfgrepo.CloneSource)
	}
	repo = r

	w, err := r.Worktree()
	if err != nil {
		log.Errorf("Error on get Repo WorkTree %s", err)
		return
	}

	wtree = w

	// retrieves the branch pointed by HEAD
	/*ref*/
	_, err = repo.Head()
	if err != nil {
		log.Errorf("Error on get HEAD repo: %s ", err)
		return
	}

	gitBranch = cfgrepo.WorkOnBranch

	// checkout to the working branch

	if gitBranch != "master" {

		branch := fmt.Sprintf("refs/remotes/origin/%s", gitBranch)
		//first  checkout
		err = w.Checkout(&git.CheckoutOptions{
			Branch: plumbing.ReferenceName(branch),
			Create: false,
			Force:  false,
		})
		if err != nil {
			log.Warnf("Can not change to brach %s, Error: %s", gitBranch, err)
			err = w.Checkout(&git.CheckoutOptions{
				Branch: plumbing.ReferenceName(branch),
				Create: true,
				Force:  false,
			})
			log.Infof("Successfully created Brach:  %s", gitBranch)
		} else {
			b := fmt.Sprintf("refs/heads/%s", gitBranch)
			headRef, err := r.Head()
			if err != nil {
				log.Warnf("Can not get HEAD ref from current branch: %s : ERR: %s", gitBranch, err)
			}
			ref := plumbing.NewHashReference(plumbing.ReferenceName(b), headRef.Hash())
			err = r.Storer.SetReference(ref)
			if err != nil {
				log.Warnf("Can not save new refence : %s : ERR: %s", b, err)
			}
			_ = w.Checkout(&git.CheckoutOptions{
				Branch: plumbing.ReferenceName(b),
				Create: false,
				Force:  false,
			})
		}
		log.Infof("Successfully changed to Brach: %s", gitBranch)
	}
	// por si acaso ha cambiado algo...
	w, err = repo.Worktree()
	if err != nil {
		log.Errorf("Error on get Repo WorkTree %s", err)
		return
	}

	wtree = w
}

// ProductStat give us the definition stat for this product
type ProductStat struct {
	Name     string   `json:"name"`
	HasDB    bool     `json:"hasDB"`
	HasG     bool     `json:"hasG"`
	HasV     bool     `json:"hasV"`
	HasA     bool     `json:"hasA"`
	GEngines []string `json:"g_engines"`
	VEngines []string `json:"v_engines"`
	AEngines []string `json:"a_engines"`
}

// EngineConfig get MainConfig this engine
type EngineConfig struct {
	ID          string      `yaml:"id" json:"id"`
	Label       string      `yaml:"label" json:"label"`
	Models      string      `yaml:"models" json:"models"`
	Description string      `yaml:"description" json:"description"`
	Dir         string      `yaml:"dir" json:"dir"`
	Config      interface{} `yaml:"config" json:"config"`
	Params      interface{} `yaml:"params" json:"params"`
}

// Engine a set of configurations related to One Engine or other
type Engine struct {
	Engine string         `yaml:"engine" json:"engine"`
	Config []EngineConfig `yaml:"config" json:"config"`
}

// Product State of a product
type Product struct {
	Product     string   `yaml:"product" json:"product"`
	Models      string   `yaml:"models" json:"models"`
	Description string   `yaml:"description" json:"description"`
	Gather      []Engine `yaml:"gather" json:"gather"`
	Visual      []Engine `yaml:"visual" json:"visual"`
	Alert       []Engine `yaml:"alert" json:"alert"`
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

		dbmap, err := dbc.GetProductDBMapByID(ps.Name)
		if err != nil {
			log.Warningf("Error on get DB map for product %s  , error: %s", ps.Name, err)
			ps.HasDB = false
		} else {
			ps.HasDB = true
			ps.GEngines = dbmap.GEngines
			ps.VEngines = dbmap.VEngines
			ps.AEngines = dbmap.AEngines
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

func trimSlash(s string) string {
	if !strings.HasPrefix(s, "/") {
		return s
	}
	for i := range s {
		if i > 0 {
			return s[i:]
		}
	}
	return s[:0]
}

// AddFile , add File to repo
func AddFile(filename string, content *bytes.Buffer) error {

	var err error

	//path := clonePath + filename
	path := filepath.Join(clonePath, filename)
	dirname := filepath.Dir(path)
	if _, err := os.Stat(dirname); os.IsNotExist(err) {
		log.Infof("Path %s does not exist.. creating...", dirname)
		os.MkdirAll(dirname, 0775)
	}

	err = ioutil.WriteFile(path, content.Bytes(), 0644)
	if err != nil {
		log.Errorf("Can not Add File to Repo, Err: %s", err)
		return err
	}
	relative_filename := trimSlash(filename)
	h, err := wtree.Add(relative_filename)
	if err != nil {
		log.Errorf("Can not Add Filename: Err: %s", err)
		return err
	}
	log.Infof("Added Filename %s in repo with hash: %+v", relative_filename, h)
	return nil
}

// AddFile , add File to repo
func RemoveFile(filename string) error {

	var err error

	//path := clonePath + filename
	path := filepath.Join(clonePath, filename)
	if _, err := os.Stat(path); os.IsNotExist(err) {
		log.Infof("File %s does not exist.. creating...", path)
		return err
	}

	relative_filename := trimSlash(filename)
	h, err := wtree.Remove(relative_filename)
	if err != nil {
		log.Errorf("Can not Remove Filename: Err: %s", err)
		return err
	}
	log.Infof("Removed filename %s in repo with hash: %+v", relative_filename, h)
	return nil
}

func PrintStatus() {
	status, err := wtree.Status()
	if err != nil {
		log.Errorf("Can not Get Status: Err: %s", err)
	}
	log.Infof("--- GIT STATUS---------------")
	log.Println(status)
	log.Infof("--- GIT STATUS----------------")
}

func Commit(msg string) error {

	PrintStatus()
	log.Debug("REPO COMMIT INIT-----------")
	commit, err := wtree.Commit(msg, &git.CommitOptions{
		Author: &object.Signature{
			Name:  gitName,
			Email: gitEmail,
			When:  time.Now(),
		},
	})
	if err != nil {
		return fmt.Errorf("Error on Get Commit %s Err: %s ", msg, err)
	}

	obj, err := repo.CommitObject(commit)
	if err != nil {
		return fmt.Errorf("Error on  Commit Objects: %s ", err)
	}
	log.Infof("Commit Done Object: %+v", obj)
	log.Debug("REPO COMMIT END-----------")
	PrintStatus()
	log.Debug("REPO PUSH INIT-----------")

	err = repo.Push(&git.PushOptions{})

	if err != nil {
		return fmt.Errorf("Error on  Commit Objects %s: %s ", err)
	}

	log.Infof("Push Done: %+v ", obj)
	log.Debug("REPO PUSH END-----------")
	PrintStatus()
	return nil
}
