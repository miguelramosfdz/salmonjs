/**
 *               __                         _____ _______
 * .-----.---.-.|  |.--------.-----.-----._|     |     __|
 * |__ --|  _  ||  ||        |  _  |     |       |__     |
 * |_____|___._||__||__|__|__|_____|__|__|_______|_______|
 *
 * salmonJS v0.2.1
 *
 * Copyright (C) 2013 Fabio Cicerchia <info@fabiocicerchia.it>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Test Module
 *
 * It manage the test case files: creation, retrieving and parsing.
 *
 * @module Test
 */
var Test = function (fsWrapper, glob, mainDir, utils) {
    /**
     * Test case directory.
     *
     * @property TEST_CASE_DIRECTORY
     * @type {String}
     * @default "/../tests/cases/"
     */
    this.TEST_CASE_DIRECTORY = '/tests/cases/';

    /**
     * Current instance.
     *
     * @property currentTest
     * @type {Object}
     * @default this
     */
    var currentTest = this;

    /**
     * TBD
     */
    this.buildSection = function (data) {
        var content = '';
        for (k in data) {
            if (data.hasOwnProperty(k)) {
               content += k + '=' + data[k] + '\n';
            }
        }

        return content;
    };

    /**
     * Create test case file.
     *
     * @method createNewCaseFile
     * @param  {String}   name     The name of the test case.
     * @param  {String}   data     The data of the test case.
     * @param  {Function} callback The data of the test case.
     * @return undefined
     */
    this.createNewCaseFile = function (url, name, data, callback) {
        var k,
            mainUrl      = url.replace(/^(.+):\/\/(\/?[^\/]+)\/?.*$/, '$1://$2')
            content      = '',
            dir          = mainDir + currentTest.TEST_CASE_DIRECTORY + mainUrl.replace(/[^a-zA-Z0-9]/g, '-'),
            testCaseFile = dir + '/' + (url === mainUrl ? '' : url.replace(mainUrl, '') + '/') + name + '.tst';

        if (url === '' || name === '' || Object.keys(data).length === 0) {
            return (callback !== undefined) ? callback() : undefined;
        }

        var content_get     = this.buildSection(data.GET);
        var content_post    = this.buildSection(data.POST);
        var content_cookie  = this.buildSection(data.COOKIE);
        var content_header  = this.buildSection(data.HEADER);
        var content_confirm = this.buildSection(data.CONFIRM);
        var content_prompt  = this.buildSection(data.PROMPT);

        content += '; Test Case File\n';
        content += '; generated by salmonJS v0.2.1 (http://fabiocicerchia.github.io/salmonjs) at ' + new Date().toUTCString() + '\n';
        content += '; url = ' + url + '\n';
        content += '; id = ' + name + '\n';
        content += '\n';
        content += '[GET]\n';
        content += content_get + '\n';
        content += '[POST]\n';
        content += content_post + '\n';
        content += '[COOKIE]\n';
        content += content_cookie + '\n';
        content += '[HTTP_HEADERS]\n';
        content += content_header + '\n';
        content += '[CONFIRM]\n';
        content += content_confirm + '\n';
        content += '[PROMPT]\n';
        content += content_prompt;

        var parts = testCaseFile.split(/\//),
            currDir = '',
            i;
        for (i = 0; i < parts.length - 1; i++) {
            currDir += parts[i] + '/';
            if (!fsWrapper.existsSync(currDir)) {
                console.log(currDir);
                fsWrapper.mkdirSync(currDir);
            }
        }

        fsWrapper.writeFileSync(testCaseFile, content, {flag: 'w+', mode: 0755});

        if (callback !== undefined) {
            callback();
        }
    };

    /**
     * Returns a list of test cases based on the URL.
     *
     * @method getCases
     * @param  {String} url The URL for the test cases.
     * @return {Object}
     */
    this.getCases = function (url) {
        var mainUrl     = url.replace(/^(.+):\/\/(\/?[^\/]+)\/.+$/, '$1://$2')
            dir         = mainDir + currentTest.TEST_CASE_DIRECTORY + mainUrl.replace(/[^a-zA-Z0-9]/g, '-'),
            testCaseDir = dir + '/' + (url === mainUrl ? '' : url.replace(mainUrl, '') + '/');

        if (url === '' || !fsWrapper.existsSync(testCaseDir)) {
            return [];
        }

        var testCase,
            cases = [],
            files = glob.sync(testCaseDir + '/*.tst');

        files.forEach(function (value) {
            testCase = currentTest.parseCaseFile(value);

            if (testCase !== {}) {
                cases.push(testCase);
            }
        });

        return cases;
    };

    /**
     * Parse a test cases file to return the testing data to be used.
     *
     * @method parseCaseFile
     * @param  {String} The test case file.
     * @return {Object}
     */
    this.parseCaseFile = function (file) {
        var content;

        if (!fsWrapper.existsSync(file)) {
            return {};
        }

        content = fsWrapper.readFileSync(file).toString();

        return utils.parseINIString(content);
    };
};

module.exports = Test;
