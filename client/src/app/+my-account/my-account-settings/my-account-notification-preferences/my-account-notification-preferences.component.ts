import { Component, Input, OnInit } from '@angular/core'
import { User } from '@app/shared'
import { I18n } from '@ngx-translate/i18n-polyfill'
import { Subject } from 'rxjs'
import { UserNotificationSetting, UserNotificationSettingValue, UserRight } from '../../../../../../shared'
import { Notifier, ServerService } from '@app/core'
import { debounce } from 'lodash-es'
import { UserNotificationService } from '@app/shared/users/user-notification.service'

@Component({
  selector: 'my-account-notification-preferences',
  templateUrl: './my-account-notification-preferences.component.html',
  styleUrls: [ './my-account-notification-preferences.component.scss' ]
})
export class MyAccountNotificationPreferencesComponent implements OnInit {
  @Input() user: User = null
  @Input() userInformationLoaded: Subject<any>

  notificationSettingKeys: (keyof UserNotificationSetting)[] = []
  emailNotifications: { [ id in keyof UserNotificationSetting ]: boolean } = {} as any
  webNotifications: { [ id in keyof UserNotificationSetting ]: boolean } = {} as any
  labelNotifications: { [ id in keyof UserNotificationSetting ]: string } = {} as any
  rightNotifications: { [ id in keyof Partial<UserNotificationSetting> ]: UserRight } = {} as any
  emailEnabled: boolean

  private savePreferences = debounce(this.savePreferencesImpl.bind(this), 500)

  constructor (
    private i18n: I18n,
    private userNotificationService: UserNotificationService,
    private serverService: ServerService,
    private notifier: Notifier
  ) {
    this.labelNotifications = {
      newVideoFromSubscription: this.i18n('New video from your subscriptions'),
      newCommentOnMyVideo: this.i18n('New comment on your video'),
      videoAbuseAsModerator: this.i18n('New video abuse'),
      blacklistOnMyVideo: this.i18n('One of your video is blacklisted/unblacklisted'),
      myVideoPublished: this.i18n('Video published (after transcoding/scheduled update)'),
      myVideoImportFinished: this.i18n('Video import finished'),
      newUserRegistration: this.i18n('A new user registered on your instance'),
      newFollow: this.i18n('You or your channel(s) has a new follower'),
      commentMention: this.i18n('Someone mentioned you in video comments')
    }
    this.notificationSettingKeys = Object.keys(this.labelNotifications) as (keyof UserNotificationSetting)[]

    this.rightNotifications = {
      videoAbuseAsModerator: UserRight.MANAGE_VIDEO_ABUSES,
      newUserRegistration: UserRight.MANAGE_USERS
    }

    this.emailEnabled = this.serverService.getConfig().email.enabled
  }

  ngOnInit () {
    this.userInformationLoaded.subscribe(() => this.loadNotificationSettings())
  }

  hasUserRight (field: keyof UserNotificationSetting) {
    const rightToHave = this.rightNotifications[field]
    if (!rightToHave) return true // No rights needed

    return this.user.hasRight(rightToHave)
  }

  updateEmailSetting (field: keyof UserNotificationSetting, value: boolean) {
    if (value === true) this.user.notificationSettings[field] |= UserNotificationSettingValue.EMAIL
    else this.user.notificationSettings[field] &= ~UserNotificationSettingValue.EMAIL

    this.savePreferences()
  }

  updateWebSetting (field: keyof UserNotificationSetting, value: boolean) {
    if (value === true) this.user.notificationSettings[field] |= UserNotificationSettingValue.WEB
    else this.user.notificationSettings[field] &= ~UserNotificationSettingValue.WEB

    this.savePreferences()
  }

  private savePreferencesImpl () {
    this.userNotificationService.updateNotificationSettings(this.user, this.user.notificationSettings)
      .subscribe(
        () => {
          this.notifier.success(this.i18n('Preferences saved'), undefined, 2000)
        },

        err => this.notifier.error(err.message)
      )
  }

  private loadNotificationSettings () {
    for (const key of Object.keys(this.user.notificationSettings)) {
      const value = this.user.notificationSettings[key]
      this.emailNotifications[key] = value & UserNotificationSettingValue.EMAIL

      this.webNotifications[key] = value & UserNotificationSettingValue.WEB
    }
  }
}
