const {
  schema,
  arrayOf,
  RequiredString,
  OptionalBoolean,
  OptionalString,
  OptionalNumber
} = require('../../../schema-utils')

const DiscordEmbedField = schema({fields: {
  name: OptionalString,
  value: OptionalString,
  inline: OptionalBoolean
}})

const DiscordMedia = schema({fields: {
  url: OptionalString,
  proxy_url: OptionalString,
  height: OptionalNumber,
  width: OptionalNumber
}})

const DiscordEmbed = schema({fields: {
  title: OptionalString,
  type: {type: String, required: false, allowed: ['rich', 'image', 'video', 'gifv', 'article', 'link']},
  description: OptionalString,
  url: OptionalString,
  timestamp: OptionalString,
  color: OptionalNumber,
  footer: {required: false, type: schema({fields: {
    text: OptionalString,
    icon_url: OptionalString,
    proxy_icon_url: OptionalString
  }})},
  image: {type: DiscordMedia, required: false},
  thumbnail: {type: DiscordMedia, required: false},
  video: {type: DiscordMedia, required: false},
  provider: {required: false, type: schema({fields: {
    name: OptionalString,
    url: OptionalString
  }})},
  author: {required: false, type: schema({fields: {
    name: OptionalString,
    url: OptionalString,
    icon_url: OptionalString,
    proxy_icon_url: OptionalString
  }})},
  fields: {type: arrayOf(DiscordEmbedField), required: false}
}})

const DiscordMessageComponent = schema({fields: {
  type: {type: Number, required: false, allowed: [
      1 /*Action Row*/, 2 /*Button*/, 3 /*Select Menu*/
  ]},
  custom_id: OptionalString,
  disabled: OptionalBoolean,
  style: {type: Number, required: false, allowed: [
    1 /*Primary*/, 2 /*Secondary*/, 3 /*Success*/, 4 /*Danger*/, 5 /*Link*/
  ]},
  label: OptionalString,
  emoji: {required: false, type: schema({fields: {
    name: OptionalString,
    id: OptionalString,
    animated: OptionalBoolean
  }})},
  url: OptionalString,
  options: {required: false, type: arrayOf(schema({fields: {
    label: OptionalString,
    value: OptionalString,
    description: OptionalString,
    emoji: {required: false, type: schema({fields: {
      name: OptionalString,
      id: OptionalString,
      animated: OptionalBoolean
    }})},
    default: OptionalBoolean
  }}))}
}})

const DiscordMessage = schema({fields: {
  content: OptionalString,
  tts: OptionalBoolean,
  file: OptionalString,
  embeds: {type: arrayOf(DiscordEmbed), required: false},
  allowed_mentions: {required: false, type: schema({fields: {
    parse: {type: arrayOf(String), required: false},
    roles: {type: arrayOf(String), required: false},
    users: {type: arrayOf(String), required: false},
    replied_user: OptionalBoolean
  }})},
  message_reference: {required: false, type: schema({fields: {
    message_id: OptionalString,
    channel_id: OptionalString,
    guild_id: OptionalString,
    fail_if_not_exists: OptionalBoolean
  }})},
  components: {type: arrayOf(DiscordMessageComponent), required: false},
  sticker_ids: {type: arrayOf(String), required: false}
}})

module.exports.DiscordChannelMessage = schema({fields: {
  channel_id: OptionalString,
  message: {type: DiscordMessage}
}})
