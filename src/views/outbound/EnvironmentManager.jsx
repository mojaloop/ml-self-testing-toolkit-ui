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
import React from "react";
import getConfig from '../../utils/getConfig'
import axios from 'axios';
import APIDocViewer from '../apis/APIDocViewer'

import { Select, Row, Col, Table, Button, Modal, Upload, message, Card, Typography, Input, Tag, Radio } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Option } = Select;
const { Text } = Typography;

class AddNewAPI extends React.Component {
  state = {
    apiName: null,
    validatedApiDefinition: {},
    selectedFile: null,
    validationError: null,
    newApiName: null,
    newApiVersion: null,
    newApiAsynchronous: null
  }
  apiBaseUrl = null

  constructor () {
    super()
    const { apiBaseUrl } = getConfig()
    this.apiBaseUrl = apiBaseUrl
  }

  validateApiFile = async () => {
    const data = new FormData() 
    data.append('file', this.state.selectedFile)
    const url = this.apiBaseUrl + "/api/openapi/validate_definition";
    const res = await axios.post(url, data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    return res.data
  }

  addApiFile = async () => {
    const data = new FormData() 
    data.append('file', this.state.selectedFile)
    data.append('name', this.state.newApiName)
    data.append('version', this.state.newApiVersion)
    data.append('asynchronous', this.state.newApiAsynchronous)
    const url = this.apiBaseUrl + "/api/openapi/definition";
    const res = await axios.post(url, data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    this.props.onAdded()
    return res.data
  }

  handleFileImport = async (infoObject) => {
    this.state.selectedFile = infoObject.file
    try {
      const validationResult = await this.validateApiFile()
      const newApiName = this.state.selectedFile && this.state.selectedFile.name && this.state.selectedFile.name.split('.')[0]
      const newApiVersion = validationResult && validationResult.apiDefinition && validationResult.apiDefinition.info && validationResult.apiDefinition.info.version
      const newApiAsynchronous = 'false'
      this.setState({validatedApiDefinition: validationResult.apiDefinition, validationError: null, newApiName, newApiVersion, newApiAsynchronous })
    } catch(err) {
      infoObject.onError('Validation Error')
      this.setState({validatedApiDefinition: null, selectedFile: null, validationError: err.response.data})
    }
  }

  getApiMethodItems = (resourceItem) => {
    return Object.keys(resourceItem).map(item => {
      if(item !== 'parameters') {
        const params = {}
        switch(item) {
          case 'get':
            params.color = 'blue'
            break
          case 'post':
            params.color = 'green'
            break
          case 'put':
            params.color = 'orange'
            break
          case 'delete':
            params.color = 'red'
            break
          case 'update':
            params.color = 'gold'
            break

        }
        return <Tag {...params} >{item}</Tag>
      } else {
        return null
      }
    })
  }

  getApiResourceItems = () => {
    if(this.state.validatedApiDefinition && this.state.validatedApiDefinition.paths) {
      const columns = [
        {
          title: 'Resource',
          dataIndex: 'resource',
        },
        {
          title: 'Methods',
          dataIndex: 'methods',
        }
      ];
  
      const data = Object.keys(this.state.validatedApiDefinition.paths).map((item,index) => {
        return {
          key: index,
          resource: item,
          methods: (
            <>
            {this.getApiMethodItems(this.state.validatedApiDefinition.paths[item])}
            </>
          )
        }
      })
      return (
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
        />
      )
    } else {
      return null
    }
  }
  

  render() {
    return (
      <>
      <Dragger
        name='spec_file'
        multiple={false}
        accept=".yaml,.yml"
        showUploadList={false}
        action={this.apiBaseUrl + "/api/openapi/definition"}
        customRequest={this.handleFileImport}
        onChange={(info) => {
          const { status } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Swagger / OpenAPI files in YAML format are supported
        </p>
      </Dragger>
      {
        this.state.validatedApiDefinition && this.state.validatedApiDefinition.info
        ? (
          <Card className="p-2">
            <Row>
              <Col span={24}>
                <Text strong>{this.state.validatedApiDefinition.info.title}</Text>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col span={12}>
                <Text strong>Name:</Text>
              </Col>
              <Col span={12}>
                <Input
                  value={this.state.newApiName}
                  onChange={e => this.setState({newApiName: e.target.value})}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col span={12}>
                <Text strong>Version:</Text>
              </Col>
              <Col span={12}>
                <Input
                  value={this.state.newApiVersion}
                  onChange={e => this.setState({newApiVersion: e.target.value})}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col span={12}>
                <Text strong>Asynchronous:</Text>
              </Col>
              <Col span={12}>
                <Radio.Group
                  value={this.state.newApiAsynchronous}
                  onChange={e => this.setState({newApiAsynchronous: e.target.value})}
                >
                  <Radio value={'true'}>Yes</Radio>
                  <Radio value={'false'}>No</Radio>
                </Radio.Group>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col span={24}>
              { this.getApiResourceItems() }
              </Col>
            </Row>
            <Row className="mt-2">
              <Col span={24}>
                <Button className="float-right" type="primary" danger
                  onClick={this.addApiFile}
                >
                  Upload
                </Button>
              </Col>
            </Row>
          </Card>
        )
        : this.state.validationError && this.state.validationError.message
          ? (
            <Card>
              <Row>
                <Col span={24}>
                  <Text><pre>{this.state.validationError.message}</pre></Text>
                </Col>
              </Row>
            </Card>
          )
          : null
      }
      </>
    )
  }
}

class EnvironmentManager extends React.Component {
  state = {
    apiVersions: [],
    serverEnvironments: [],
    newAPIDialogEnabled: false,
    selectedApiIndex: null,
    apiDocViewerVisible: false
  }

  getApiVersions = async () => {
    const { apiBaseUrl } = getConfig()
    const response = await axios.get(apiBaseUrl + "/api/openapi/api_versions")
    return response.data
  }

  getServerEnvironments = async () => {
    const { apiBaseUrl } = getConfig()
    const response = await axios.get(apiBaseUrl + `/api/samples/list/environments`)
    return response.data && response.data.body
  }

  componentDidMount = async () => {
    await this.refreshServerEnvironments()
  }

  refreshServerEnvironments = async () => {
    const serverEnvironments = await this.getServerEnvironments()
    console.log(serverEnvironments)
    this.setState({ serverEnvironments })
  }

  handleApiAdded = () => {
    // this.refreshApiVersions()
    this.setState({newAPIDialogEnabled: false})
  }

  handleDeleteAPI = async () => {
    const res = await axios.delete(this.getSelectedVersionURL())
    // this.refreshApiVersions()
    return res.data
  }

  getSelectedVersionURL = () => {
    const { apiBaseUrl } = getConfig()
    if (this.state.selectedApiIndex !== null) {
      const url = apiBaseUrl + '/api/openapi/definition/' +  this.state.apiVersions[this.state.selectedApiIndex].type + '/' + this.state.apiVersions[this.state.selectedApiIndex].majorVersion + '.' + this.state.apiVersions[this.state.selectedApiIndex].minorVersion
      return url
    } else {
      return ''
    }
  }

  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedApiIndex: selectedRowKeys[0]})
      },
      selectedRowKeys: [this.state.selectedApiIndex]
    }

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
      },
    ];

    const data = this.state.serverEnvironments.map((item, index) => {
      return {
        key: index,
        name: item.name,
        size: item.size,
        type: 'Server'
      }
    })

    return (
      <>
        {/* <Modal
          title='API Documentation'
          style={{ top: 20 }}
          className="p-3"
          width='90%'
          destroyOnClose
          footer={null}
          visible={this.state.apiDocViewerVisible}
          onCancel={ e => {
            this.setState({apiDocViewerVisible: false})
          }}
        >
          <APIDocViewer specUrl={this.getSelectedVersionURL()} />
        </Modal> */}

        {/* Page content */}
          <Row className="mt--7 mb-4">
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Button
                    className="float-right"
                    type="primary"
                    onClick={() => {
                      this.setState({newAPIDialogEnabled: true})
                    }}
                  >
                    Import to Workspace
                  </Button>
                  <Button
                    type="primary"
                    danger
                    onClick={this.handleDeleteAPI}
                    disabled={!(this.state.apiVersions && this.state.apiVersions[this.state.selectedApiIndex] && this.state.apiVersions[this.state.selectedApiIndex].additionalApi)}
                  >
                    Delete
                  </Button>
                  <Button
                    className="ml-2"
                    type="primary"
                    shape="round"
                    info
                    onClick={ e => {
                      this.setState({apiDocViewerVisible: true})
                    }}
                    disabled={!(this.state.apiVersions && this.state.apiVersions[this.state.selectedApiIndex])}
                  >
                    Preview Environment
                  </Button>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col span={24}>
                  <Table
                    rowSelection={{
                      type: 'radio',
                      ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                  />
                </Col>
              </Row>
              <Row className="mt-2">
                <Col span={24}>
                  <AddNewAPI
                    onAdded={this.handleApiAdded}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
      </>
    );
  }
}

export default EnvironmentManager;
