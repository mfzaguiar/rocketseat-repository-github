import React, { Component } from 'react';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  ContainerButtons,
  Pagination,
  ProxButton,
  PrevButton,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    pg: 1,
    issueTP: 'all',
    pgDisable: true,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  handleChangeButtonIssues = async (e, issueType) => {
    e.preventDefault();
    this.setState({ loading: true, issueTP: issueType });
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`repos/${repoName}/issues`, {
      params: {
        state: `${issueType}`,
        per_page: 5,
        page: 1,
      },
    });

    this.setState({
      loading: false,
      issues: issues.data,
    });
  };

  handlePagination = async (e, pagination) => {
    e.preventDefault();
    const { match } = this.props;
    const { issueTP, pg } = this.state;
    this.setState({ loading: true });
    const repoName = decodeURIComponent(match.params.repository);

    if (pagination === 'more') {
      const issues = await api.get(`repos/${repoName}/issues`, {
        params: {
          state: `${issueTP}`,
          per_page: 5,
          page: pg + 1,
        },
      });

      this.setState({
        loading: false,
        issues: issues.data,
        pg: pg + 1,
        pgDisable: false,
      });
    } else {
      const issues = await api.get(`repos/${repoName}/issues`, {
        params: {
          state: `${issueTP}`,
          per_page: 5,
          page: pg - 1,
        },
      });

      this.setState({
        loading: false,
        issues: issues.data,
        pg: pg - 1,
        pgDisable: pg === 2 && true,
      });
    }
  };

  render() {
    const { repository, issues, loading, pgDisable } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ContainerButtons>
          <button
            type="button"
            onClick={e => {
              this.handleChangeButtonIssues(e, 'all');
            }}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={e => {
              this.handleChangeButtonIssues(e, 'open');
            }}
          >
            Abertas
          </button>
          <button
            type="button"
            onClick={e => {
              this.handleChangeButtonIssues(e, 'closed');
            }}
          >
            Fechadas
          </button>
        </ContainerButtons>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <PrevButton
            type="button"
            pgDisable={pgDisable ? 1 : 0}
            onClick={e => this.handlePagination(e, 'minus')}
          >
            <FaAngleLeft />
          </PrevButton>
          <ProxButton
            type="button"
            onClick={e => this.handlePagination(e, 'more')}
          >
            <FaAngleRight />
          </ProxButton>
        </Pagination>
      </Container>
    );
  }
}
