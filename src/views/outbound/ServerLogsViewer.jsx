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
 * Steven Oderayi <steven.oderayi@modusbox.com> (Original Author)
 --------------
 ******/
import React from "react";
import { Table, Tag } from "antd";

class ServerLogsViewer extends React.Component {
  constructor() {
    super()
    this.state = {
      logs: [],
      visible: false,
    }
  }

  componentDidMount = () => this.setState({ logs: this.props.logs })

  setLogs = (logs) => this.setState({ logs })

  setVisibility = (visible) => {
    this.setState({ visible })
  }

  marshalLogItem = (log, index) => ({
    service: log.metadata.trace.service,
    timestamp: log.metadata.trace.startTimestamp,
    fspiop_source: log.metadata.trace.tags.source,
    fspiop_destination: log.metadata.trace.tags.destination,
    status: log.metadata.event.state.status,
    fullLog: log,
    key: index
  })

  render() {
    if ((!this.props.isVisible && !this.state.visible) || !this.state.logs) return null;
    const columns = [
      { title: "Service", dataIndex: 'service', key: 'servcie' },
      { title: "Timestamp", dataIndex: 'timestamp', key: 'timestamp' },
      { title: "Source", dataIndex: 'fspiop_source', key: 'fspiop_source' },
      { title: "Destination", dataIndex: 'fspiop_destination', key: 'fspiop_destination' },
      { 
        title: "Status", 
        dataIndex: 'status', 
        key: 'status', 
        render: text => text === 'success' ? <Tag color="green">{text}</Tag> : <Tag color="red">{text}</Tag> 
      }
    ]
    const dataSource = this.state.logs.map((log, i) => ({ ...this.marshalLogItem(log, i) }))

    return <Table
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      scroll={{ y: 480 }}
      expandable={{
        expandedRowRender: log => <pre><code>{JSON.stringify(log.fullLog, null, 2)}</code></pre>
      }}
    />
  }
}

export default ServerLogsViewer;
