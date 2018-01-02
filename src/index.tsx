import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { Container, Divider } from 'semantic-ui-react'
import { SearchBoxView } from './SearchBoxView'
import { SearchStore } from './SearchStore'
import { SearchResultsView } from './SearchResultsView'

mobx.useStrict(true)


class RootView extends React.Component {

    render() {
        var store = new SearchStore();
        return (
            <div>
                <Container textAlign="center">
                    <SearchBoxView searchStore={store} />
                </Container>
                <Divider />
                <SearchResultsView searchStore={store} />
            </div>
        );
    }
}



console.log("Starting")
ReactDOM.render(<RootView />, document.getElementById('root'));
