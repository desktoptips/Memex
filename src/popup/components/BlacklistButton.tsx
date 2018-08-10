import React, { PureComponent } from 'react'

import analytics from '../../analytics'
import Button from './Button'
import LinkButton from './LinkButton'
import SplitButton from './SplitButton'
import { remoteFunction } from '../../util/webextensionRPC'
import { OPTIONS_URL } from '../constants'

const styles = require('./Button.css')

export interface Props {
    isDisabled: boolean
    isBlacklisted: boolean
    url: string
    postBlacklistHook: () => void
}

export interface State {
    /** Denotes whether or not the blacklist URL vs domain choice should be shown. */
    shouldShowChoice: boolean
}

class BookmarkButton extends PureComponent<Props, State> {
    private addToBlacklistRPC: (url: string) => Promise<void>
    private processEventRPC: (args: any) => Promise<void>

    state: State = {
        shouldShowChoice: false,
    }

    constructor(props) {
        super(props)

        this.addToBlacklistRPC = remoteFunction('addToBlacklist')
        this.processEventRPC = remoteFunction('processEvent')
    }

    private handleBlacklistBtnClick = (
        event: React.SyntheticEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault()

        this.setState(state => ({ shouldShowChoice: true }))
    }

    private handleBlacklistingChoice = (isDomainChoice: boolean) => (
        event: React.SyntheticEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault()

        analytics.trackEvent({
            category: 'Popup',
            action: isDomainChoice ? 'Blacklist domain' : 'Blacklist site',
        })

        this.processEventRPC({
            type: isDomainChoice ? 'blacklistDomain' : 'blacklistSite',
        })

        const url = isDomainChoice
            ? new URL(this.props.url).hostname
            : this.props.url

        this.addToBlacklistRPC(url)
        this.setState(state => ({ shouldShowChoice: false }))

        this.props.postBlacklistHook()
    }

    private renderBlacklisted() {
        return (
            <LinkButton
                href={`${OPTIONS_URL}#/blacklist`}
                itemClass={styles.itemBlacklisted}
                btnClass={styles.itemBtnBlacklisted}
            >
                This Page is Blacklisted. Undo>>
            </LinkButton>
        )
    }

    private renderUnblacklisted() {
        return (
            <Button
                onClick={this.handleBlacklistBtnClick}
                disabled={this.props.isDisabled}
                btnClass={styles.blacklist}
            >
                Blacklist Current Page
            </Button>
        )
    }

    private renderBlacklistChoice() {
        return (
            <SplitButton iconClass={styles.blacklist}>
                <Button onClick={this.handleBlacklistingChoice(true)}>
                    Domain
                </Button>
                <Button onClick={this.handleBlacklistingChoice(false)}>
                    URL
                </Button>
            </SplitButton>
        )
    }

    render() {
        if (this.state.shouldShowChoice) {
            return this.renderBlacklistChoice()
        }

        if (this.props.isBlacklisted) {
            return this.renderBlacklisted()
        }

        return this.renderUnblacklisted()
    }
}

export default BookmarkButton
