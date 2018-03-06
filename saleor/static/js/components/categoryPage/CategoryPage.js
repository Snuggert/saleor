import queryString from 'query-string';
import React, {Component, PropTypes} from 'react';
import {gql} from 'react-apollo';

import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import ProductFilters from './ProductFilters';
import ProductList from './ProductList';
import SortBy from './SortBy';
import {isMobile} from '../utils';

const PAGINATE_BY = 24;

class CategoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtersMenu: !isMobile()
    };
  }


  static propTypes = {
    attributes: PropTypes.array,
    category: PropTypes.object
  };

  incrementProductsCount = () => {
    this.props.data.variables.first += PAGINATE_BY;
    this.refetch();
  };

  setSorting = (value) => {
    this.props.data.refetch({
      sortBy: value
    })
  };

  toggleMenu = (target) => {
    this.setState({
      filtersMenu: !target
    });
  };

  static fragments = {
    category: gql`
      fragment CategoryPageFragmentQuery on CategoryType {
        pk
        name
        url
        ancestors {
          name
          pk
          url
        }
        children {
          name
          pk
          url
          slug
        }
        products (
          first: $first
          orderBy: $sortBy
          attributes: $attributesFilter
          priceGte: $minPrice,
          priceLte: $maxPrice,
        ) {
          ...ProductListFragmentQuery
        }
      }
      ${ProductList.fragments.products}
    `
  };

  clearFilters = () => {
    this.props.data.refetch({
      attributesFilter: [],
      minPrice: null,
      maxPrice: null
    })
  };

  updateAttributesFilter = (key) => {
    const index = this.props.data.variables.attributesFilter.indexOf(key);
    if (index < 0) {
      this.props.data.variables.attributesFilter.push(key);
    } else {
      this.props.data.variables.attributesFilter.splice(index, 1);
    }
    this.props.data.refetch({
      attributesFilter: this.props.data.variables.attributesFilter
    });
  };

  updatePriceFilter = (minPrice, maxPrice) => {
    this.props.data.refetch({
      minPrice: parseFloat(minPrice) || null,
      maxPrice: parseFloat(maxPrice) || null
    });
  };

  persistStateInUrl() {
    const {attributesFilter, count, maxPrice, minPrice, sortBy} = this.props.data.variables;
    let urlParams = {};
    if (minPrice) {
      urlParams['minPrice'] = minPrice;
    }
    if (maxPrice) {
      urlParams['maxPrice'] = maxPrice;
    }
    if (count > PAGINATE_BY) {
      urlParams['count'] = count;
    }
    if (sortBy) {
      urlParams['sortBy'] = sortBy;
    }
    attributesFilter.forEach(filter => {
      const [attributeName, valueSlug] = filter.split(':');
      if (attributeName in urlParams) {
        urlParams[attributeName].push(valueSlug);
      } else {
        urlParams[attributeName] = [valueSlug];
      }
    });
    const url = Object.keys(urlParams).length ? '?' + queryString.stringify(urlParams) : location.href.split('?')[0];
    history.pushState({}, null, url);
  }

  //
  componentDidUpdate() {
    // Persist current state of relay variables as query string. Current
    // variables are available in props after component rerenders, so it has to
    // be called inside componentDidUpdate method.
    this.persistStateInUrl();
  }

  render() {
    const attributes = this.props.data.attributes;
    const category = this.props.data.category;
    const variables = this.props.data.variables;
    const pendingVariables = {};
    const {filtersMenu} = this.state;
    console.log(this.props.data);
    return (
      <div className="category-page">
        <div className="category-top">
          <div className="row">
            <div className="col-md-7">
              <ul className="breadcrumbs list-unstyled d-none d-md-block">
                <li><a href="/">{pgettext('Main navigation item', 'Home')}</a></li>
                {category.ancestors && (category.ancestors.map((ancestor) => {
                  return (
                    <li key={ancestor.pk}><a href={ancestor.url}>{ancestor.name}</a></li>
                  );
                }))}
                <li><a href={category.url}>{category.name}</a></li>
              </ul>
            </div>
            <div className="col-md-5">
              <div className="row">
                <div className="col-6 col-md-2 col-lg-6 filters-menu">
                  <span className="filters-menu__label d-sm-none"
                        onClick={() => this.toggleMenu(filtersMenu)}>{pgettext('Category page filters', 'Filters')}</span>
                  {(variables.attributesFilter.length || variables.minPrice || variables.maxPrice) && (
                    <span className="filters-menu__icon d-sm-none"></span>
                  )}
                </div>
                <div className="col-6 col-md-10 col-lg-6">
                  <SortBy sortedValue={variables.sortBy} setSorting={this.setSorting} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 col-lg-3">
            <div className="product-filters">
              <CategoryFilter category={category}/>
            </div>
            {filtersMenu && (
              <div>
                <h2>
                  {pgettext('Category page filters', 'Filters')}
                  <span className="clear-filters float-right"
                        onClick={this.clearFilters}>{pgettext('Category page filters', 'Clear filters')}</span>
                </h2>
                <div className="product-filters">
                  <ProductFilters
                    attributes={attributes}
                    checkedAttributes={variables.attributesFilter}
                    onFilterChanged={this.updateAttributesFilter}
                  />
                  <PriceFilter
                    onFilterChanged={this.updatePriceFilter}
                    maxPrice={variables.maxPrice}
                    minPrice={variables.minPrice}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="col-md-8 col-lg-9 category-list">
            <div>
              <ProductList
                onLoadMore={this.incrementProductsCount}
                products={category.products}
                updating={pendingVariables}
                loading={this.props.data.loading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryPage;
