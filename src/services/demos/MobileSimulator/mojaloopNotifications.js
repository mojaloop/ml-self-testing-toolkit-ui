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

import socketIOClient from "socket.io-client";
import getConfig from '../../../utils/getConfig'

class NotificationService {
  logTypes = {
    outbound: {
      socket: null,
      socketTopic: "newOutboundLog"
    },
    inbound: {
      socket: null,
      socketTopic: "newLog"
    }
  }
  notificationEventFunction = () => {}

  setNotificationEventListener (notificationEventFunction) {
    this.notificationEventFunction = notificationEventFunction
  }

  apiBaseUrl = ''

  constructor () {
    const { apiBaseUrl } = getConfig()
    this.apiBaseUrl = apiBaseUrl
    for (const logType of Object.keys(this.logTypes)) {
      const item = this.logTypes[logType]
      item.socket = socketIOClient(this.apiBaseUrl)
      item.socket.on(item.socketTopic, log => {
        this.handleNotificationLog(log)
      });
    }
  }

  disconnect () {
    for (const logType of Object.keys(this.logTypes)) {
      this.logTypes[logType].socket.disconnect()
    }
  }

  notifyPayerMonitorLog = (log) => {
    // Monitoring Logs
    this.notificationEventFunction({
      category: 'payerMonitorLog',
      type: 'log',
      data: {
        log: log
      }
    })
  }

  notifyPayeeMonitorLog = (log) => {
    // Monitoring Logs
    this.notificationEventFunction({
      category: 'payeeMonitorLog',
      type: 'log',
      data: {
        log: log
      }
    })
  }

  handleNotificationLog = (log) => {
    // console.log(log)

    // Payer Logs
    // Catch get Parties request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Sending request')
          && log.resource
          && log.resource.method === 'get'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'getParties',
        data: {
          resource: log.resource
        }
      })
    }

    // Catch get Parties response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Received response')
          && log.resource
          && log.resource.method === 'get'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'getPartiesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.message.replace('Received response ', '')
        }
      })
    }

    // Catch put Parties
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putParties',
        data: {
          resource: log.resource,
          party: log.additionalData && log.additionalData.request && log.additionalData.request.body ? log.additionalData.request.body.party : null
        }
      })
    }

    // Catch put Parties response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putPartiesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }

    // Catch post Quotes request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Sending request')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/quotes')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'postQuotes',
        data: {
          resource: log.resource,
          quotesRequest: log.additionalData && log.additionalData.request ? log.additionalData.request.body : null
        }
      })
    }
    // Catch post Quotes response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Received response')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/quotes')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'postQuotesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.message.replace('Received response ', '')
        }
      })
    }

    // Catch put Quotes
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/quotes/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putQuotes',
        data: {
          resource: log.resource,
          quotesResponse: log.additionalData && log.additionalData.request ? log.additionalData.request.body : null
        }
      })
    }

    // Catch put Quotes response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/quotes/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putQuotesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }
    // Catch post Transfers request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Sending request')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/transfers')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'postTransfers',
        data: {
          resource: log.resource,
          transfersRequest: log.additionalData && log.additionalData.request ? log.additionalData.request.body : null
        }
      })
    }
    // Catch post Transfers response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Received response')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/transfers')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'postTransfersResponse',
        data: {
          resource: log.resource,
          responseStatus: log.message.replace('Received response ', '')
        }
      })
    }

    // Catch put Transfers
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/transfers/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putTransfers',
        data: {
          resource: log.resource,
          transfersResponse: log.additionalData && log.additionalData.request ? log.additionalData.request.body : null
        }
      })
    }

    // Catch put Transfers response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/transfers/')
    ) {
      this.notifyPayerMonitorLog(log)
      this.notificationEventFunction({
        category: 'payer',
        type: 'putTransfersResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }

    // *********** Payee Side Logs ********* //
    // Catch get Parties request
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: get')
          && log.resource
          && log.resource.method === 'get'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeeGetParties',
        data: {
          resource: log.resource
        }
      })
    }

    // Catch get Parties response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: get')
          && log.resource
          && log.resource.method === 'get'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeeGetPartiesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }
    // Catch put Parties request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutParties',
        data: {
          resource: log.resource
        }
      })
    }

    // Catch put Parties response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/parties/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutPartiesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ' ' + log.additionalData.response.statusText
        }
      })
    }
    // Catch post Quotes request
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: post')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/quotes')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePostQuotes',
        data: {
          resource: log.resource,
          requestBody: log.additionalData.request.body
        }
      })
    }

    // Catch post Quotes response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: post')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/quotes')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePostQuotesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }
    // Catch put Quotes request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/quotes/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutQuotes',
        data: {
          resource: log.resource
        }
      })
    }

    // Catch put Quotes response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/quotes/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutQuotesResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ' ' + log.additionalData.response.statusText
        }
      })
    }
    // Catch post Transfers request
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Request: post')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/transfers')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePostTransfers',
        data: {
          resource: log.resource,
          requestBody: log.additionalData.request.body
        }
      })
    }

    // Catch post Transfers response
    if ( log.notificationType === 'newLog'
          && log.message.startsWith('Response: post')
          && log.resource
          && log.resource.method === 'post'
          && log.resource.path.startsWith('/transfers')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePostTransfersResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ''
        }
      })
    }
    // Catch put Transfers request
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Request: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/transfers/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutTransfers',
        data: {
          resource: log.resource,
          requestBody: log.additionalData.request.body
        }
      })
    }

    // Catch put Transfers response
    if ( log.notificationType === 'newOutboundLog'
          && log.message.startsWith('Response: put')
          && log.resource
          && log.resource.method === 'put'
          && log.resource.path.startsWith('/transfers/')
    ) {
      this.notifyPayeeMonitorLog(log)
      this.notificationEventFunction({
        category: 'payee',
        type: 'payeePutTransfersResponse',
        data: {
          resource: log.resource,
          responseStatus: log.additionalData.response.status + ' ' + log.additionalData.response.statusText
        }
      })
    }

  }

}

export default NotificationService
