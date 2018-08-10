import React, { PureComponent } from 'react'
import cx from 'classnames'

import Button from './Button'
import { remoteFunction } from '../../util/webextensionRPC'
const styles = require('./Button.css')

export interface Props {
    isDisabled: boolean
    isBookmarked: boolean
    url: string
    tabId: number
    updateLastActive: () => void
    closePopup: () => void
}

class BookmarkButton extends PureComponent<Props> {
    private createBookmarkRPC: (
        args: { url: string; tabId: number },
    ) => Promise<void>
    private deleteBookmarkRPC: (args: { url: string }) => Promise<void>

    constructor(props) {
        super(props)

        this.createBookmarkRPC = remoteFunction('addBookmark')
        this.deleteBookmarkRPC = remoteFunction('delBookmark')
    }

    private handleAddBookmark = (
        event: React.SyntheticEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault()
        const { url, tabId } = this.props

        if (!this.props.isBookmarked) {
            this.createBookmarkRPC({ url, tabId })
        } else {
            this.deleteBookmarkRPC({ url })
        }

        this.props.updateLastActive() // Consider user active (analytics)
        this.props.closePopup()
    }

    render() {
        const text = this.props.isBookmarked
            ? 'Unbookmark this Page'
            : 'Bookmark this Page'

        return (
            <Button
                onClick={this.handleAddBookmark}
                btnClass={cx({
                    [styles.bookmarkedBtn]: this.props.isBookmarked,
                    [styles.unbookmarkedBtn]: !this.props.isBookmarked,
                })}
                disabled={this.props.isDisabled}
            >
                {text}
            </Button>
        )
    }
}

export default BookmarkButton
