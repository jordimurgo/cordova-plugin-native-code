#!/usr/bin/env node

/* ======================================================
 *       ___ _
 *   ___|  _| |_ ___ ___    ___ ___ ___ ___ ___ ___ ___
 *  | .'|  _|  _| -_|  _|  | . |  _| -_| . | .'|  _| -_|
 *  |__,|_| |_| |___|_|    |  _|_| |___|  _|__,|_| |___|
 *                         |_|         |_|
 *   
 *  1) Load or create the codesigners.json file.
 *  2) Inject codesigners fingerprints into the code.
 * 
 *  3) Generate a random password to hash filenames.
 *  4) Scramble filenames using password and original path.
 *  5) Delete original unscrambled files.
 *  5) Inject password into the source code.
 *
 * ====================================================== */

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var os = require('os');
var process = require('process');

module.exports = function(_context) {
    var ansi = _context.requireCordovaModule("ansi");
    var cursor = ansi(process.stdout);
    var cordova_util = _context.requireCordovaModule("cordova-lib/src/cordova/util");
    var ConfigParser = _context.requireCordovaModule("cordova-common").ConfigParser;
    var shell = _context.requireCordovaModule('cordova-lib/node_modules/shelljs');

    var projectRoot = cordova_util.isCordova();
    var xml = cordova_util.projectConfig(projectRoot);
    var cfg = new ConfigParser(xml);
    var appId = cfg.packageName();

    var Q = _context.requireCordovaModule('q');
    var deferral = new Q.defer();

    var rootDir = _context.opts.projectRoot;
    var pluginDir = _context.opts.plugin.pluginInfo.dir;

    // 1) Load or create the codesigners.json file.
    var signersFile = path.join(rootDir, 'codesigners.json');
    try {
        fs.accessSync(signersFile, fs.R_OK);
    } catch (ex) {
        // create basic codesigners.json
        configureSigners(signersFile);
        console.log("** Please check " + signersFile + " configuration. **");
    }
    var codeSigners = require(signersFile);

    var ConfigParser = _context.requireCordovaModule('cordova-lib').configparser;
    _context.opts.platforms.map(function(_platform) {

        if (_platform == 'android') {
            //             _         _   _
            //   ___ ___ _| |___ ___|_|_| |
            //  | .'|   | . |  _| . | | . |
            //  |__,|_|_|___|_| |___|_|___|
            //
            var androidDir = path.join(rootDir, 'platforms/android');
            var nativeDir = path.join(rootDir, 'native', 'android'); 
            
            var parts = appId.split(".");
            var appName = parts[parts.length-1];
            
            var from = path.join(nativeDir, '*');
            var to = path.join(androidDir, 'cordova-plugin-native-code', appName + '-NativeCode');

            console.log("--- Injecting Native Code from %s to %s", from, to);
                        
            shell.cp('-rf', from, to);

        } else {
            console.log("I'm sorry, platform " + _platform + " is not supported yet!");
        }
    });

    deferral.resolve();
    return deferral.promise;
}

//----------------------------------------------------------- Private functions


/*
     Copyright (c) 2015 GFT Appverse, S.L., Sociedad Unipersonal.
    
     This Source Code Form is subject to the terms of the Appverse Public License 
     Version 2.0 (“APL v2.0”). If a copy of the APL was not distributed with this 
     file, You can obtain one at http://www.appverse.mobi/licenses/apl_v2.0.pdf. [^]
    
     Redistribution and use in source and binary forms, with or without modification, 
     are permitted provided that the conditions of the AppVerse Public License v2.0 
     are met.
    
     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     DISCLAIMED. EXCEPT IN CASE OF WILLFUL MISCONDUCT OR GROSS NEGLIGENCE, IN NO EVENT
     SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
     WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT(INCLUDING NEGLIGENCE OR OTHERWISE) 
     ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
     POSSIBILITY OF SUCH DAMAGE.    
*/

