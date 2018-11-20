# IPAS-home

Main HOME page for administration of the IPAS platform

If you wish to compile from source code you can follow the next steps

## Run from master
If you want to build a package yourself, or contribute. Here is a guide for how to do that.

### Dependencies

- Go 1.8
- NodeJS >=6.2.1

### Get Code

```bash
mkdir -p $GOPATH/src/bitbucket.org/everis_ipas/ipas-home
cd $GOPATH/src/bitbucket.org/everis_ipas/ipas-home
git clone https://ipasdevel@bitbucket.org/everis_ipas/ipas-home.git
export PATH=$PATH:$GOPATH/bin/
```

### Building the backend


```bash
go run build.go setup            (only needed once to install godep)
```

### Building frontend and backend in production mode

```bash
npm install
PATH=$(npm bin):$PATH
npm run build:pro #will build fronted and backend
```
### Creating minimal package tar.gz

```bash
npm run postbuild #will build fronted and backend
```

### Running first time
To execute without any configuration you need a minimal config.toml file on the conf directory.

```bash
cp conf/sample.ipashome.toml conf/ipashome.toml
./bin/ipashome
```

### Recompile backend on source change (only for developers)

To rebuild on source change (requires that you executed godep restore)
```bash
go get github.com/Unknwon/bra
npm start
```
will init a change autodetect webserver with angular-cli (ng serve) and also a autodetect and recompile process with bra for the backend


#### Online config

Now you wil be able to configure metrics/measuremnets and devices from the builting web server at  http://localhost:5090 or http://localhost:4200 if working in development mode (npm start)
