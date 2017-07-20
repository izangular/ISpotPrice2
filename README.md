## How to install and run the project

### Requirements

  - Nodejs v6.x

### 1. Clone the project on your machine, install the dependencies and start

    $ git clone https://github.com/izangular/ISpotPrice2.git
    $ cd ISpotPrice2
    $ npm install -g ionic cordova
    $ cordova plugin add cordova-plugin-camera --variable CAMERA_USAGE_DESCRIPTION="'$(PRODUCT_NAME)' uses camera" --variable PHOTOLIBRARY_USAGE_DESCRIPTION="'$(PRODUCT_NAME)' uses photos"
    $ ionic plugin add cordova-plugin-file
    $ ionic plugin add cordova-plugin-file-transfer
    $ ionic plugin add cordova-plugin-media
    $ ionic plugin add ionic-plugin-keyboard
    $ ionic plugin add cordova-plugin-network-information
    $ ionic plugin add cordova-sqlite-storage
    $ npm install
    $ ionic serve


## Access

- Info of code version and database connected

    [localhost:8100](http://localhost:8100)

## Contributing guidelines

### Version control

- Create a new branch from dev for your feature
- Write your code in the new branch and test it locally
- It is OK to commit your feature branch on github
- When everything is working fine you can merge your branch back with dev and push to github

