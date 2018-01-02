import { observer } from 'mobx-react';
import { ISearchProps } from './SearchStore';
import * as React from 'react';
import { Debounce } from 'lodash-decorators';
import { Input } from 'semantic-ui-react'

@observer
export class SearchBoxView extends React.Component<ISearchProps, any> {

    render() {
        return (
            <div>
                <Input
                    type="text"
                    icon="search"
                    size="huge"
                    iconPosition="left"
                    loading={this.props.searchStore.isSearching}
                    onChange={this.handleChange.bind(this)}
                    placeholder="Search..."
                />
            </div>
        );
    }


    handleChange(e: React.FormEvent<HTMLInputElement>) {
        // HACK: Seems like this should be in the framework but can't find an integrated debounce
        e.persist();
        this.handleChangeDebounced(e.currentTarget.value);
    }

    @Debounce(200)
    handleChangeDebounced(newValue: string) {
        this.props.searchStore.search(newValue);
    }
};
