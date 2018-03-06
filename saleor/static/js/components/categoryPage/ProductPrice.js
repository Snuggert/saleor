import React, {Component, PropTypes} from 'react';
import InlineSVG from 'react-inlinesvg';
import {gql} from 'react-apollo';

import SaleImg from '../../../images/sale-bg.svg';


class ProductPrice extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    availability: PropTypes.object.isRequired,
    price: PropTypes.object.isRequired
  };

  static fragments = {
    availability: gql`
      fragment ProductPriceFragmentQuery on ProductAvailability {
        available
        discount {
          gross {
            amount
            currency
          }
        }
        priceRange {
          stop {
            gross {
              amount
              currency
              localized
            }
          }
          start {
            gross {
              amount
              currency
              localized
            }
          }
        }
      }
    `
  };

  render() {
    const { discount, priceRange } = this.props.availability;
    const isPriceRange = priceRange && priceRange.start.gross.amount !== priceRange.stop.gross.amount;
    return (
      <div>
        <span itemProp="price">
          {isPriceRange && <span>{pgettext('product price range', 'from')} </span>} {priceRange.start.gross.localized}
        </span>
        {discount && (
          <div className="product-list__sale"><InlineSVG src={SaleImg}/><span
            className="product-list__sale__text">{pgettext('Sale (discount) label for item in product list', 'Sale')}</span>
          </div>
        )}
      </div>
    );
  }
}

export default ProductPrice;
