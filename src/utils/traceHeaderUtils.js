/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation

 * ModusBox
 * Vijaya Kumar Guthi <vijaya.guthi@modusbox.com> (Original Author)
 --------------
 ******/
class TraceHeaderUtils {

  randHex (len) {
    const maxlen = 8
    const min = Math.pow(16,Math.min(len,maxlen)-1) 
    const max = Math.pow(16,Math.min(len,maxlen)) - 1
    const n   = Math.floor( Math.random() * (max-min+1) ) + min
    let r   = n.toString(16)
    while ( r.length < len ) {
       r = r + this.randHex( len - maxlen )
    }
    return r
  }

  getTraceIdPrefix () {
    // Define a traceID prefix (4 hex chars)
    return 'aabb'
  }

  generateSessionId () {
    // Create a session ID (24 hex chars)
    return this.randHex(24)
  }

  generateEndToEndId () {
    // Create a end to end transaction ID (4 hex chars)
    return this.randHex(4)
  }
}

export default TraceHeaderUtils
