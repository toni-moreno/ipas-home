package repo

import (
	"os"

	"bitbucket.org/everis_ipas/ipas-home/pkg/config"
	"github.com/Sirupsen/logrus"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
)

var (
	log     *logrus.Logger
	confDir string              //Needed to get File Filters data
	dbc     *config.DatabaseCfg //Needed to get Custom Filter  data
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

// NewExport ExportData type creator
func Init(repo *config.GitRepo) {

	if _, err := os.Stat(repo.ClonePath); os.IsNotExist(err) {
		err := os.Mkdir(repo.ClonePath, 0750)
		if err != nil {
			log.Errorf("Creating Repo Path [ %s ] : %s", repo.ClonePath, err)
			return
		} else {
			log.Infof("Creating Repo Path [ %s ]", repo.ClonePath)
		}
	}

	r, err := git.PlainClone(repo.ClonePath, false, &git.CloneOptions{
		URL:      repo.CloneSource,
		Progress: os.Stdout,
	})
	if err != nil {
		log.Errorf("Error on Clone repo %s ", repo.CloneSource)
		return
	}

	// retrieves the branch pointed by HEAD
	ref, err := r.Head()
	if err != nil {
		log.Errorf("Error on get HEAD repo ")
		return
	}

	// ... retrieves the commit history
	cIter, err := r.Log(&git.LogOptions{From: ref.Hash()})
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
