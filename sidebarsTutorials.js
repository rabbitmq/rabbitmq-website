/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    tutorialsSidebar: [
        {
            type: 'doc',
            id: 'index',
            label: 'Get Started',
        },
        {
            type: 'category',
            label: 'Python',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-python',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-python',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-python',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-python',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-python',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-python',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'Java',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-java',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-java',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-java',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-java',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-java',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-java',
                    label: 'RPC',
                },
                {
                    type: 'doc',
                    id: 'tutorial-seven-java',
                    label: 'Publisher Confirms',
                },
            ]
        },
        {
            type: 'category',
            label: 'Ruby',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-ruby',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-ruby',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-ruby',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-ruby',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-ruby',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-ruby',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'PHP',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-php',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-php',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-php',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-php',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-php',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-php',
                    label: 'RPC',
                },
                {
                    type: 'doc',
                    id: 'tutorial-seven-php',
                    label: 'Publisher Confirms',
                },
            ]
        },
        {
            type: 'category',
            label: '.NET',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-dotnet',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-dotnet',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-dotnet',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-dotnet',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-dotnet',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-dotnet',
                    label: 'RPC',
                },
                {
                    type: 'doc',
                    id: 'tutorial-seven-dotnet',
                    label: 'Publisher Confirms',
                },
            ]
        },
        {
            type: 'category',
            label: 'JavaScript',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-javascript',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-javascript',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-javascript',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-javascript',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-javascript',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-javascript',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'Go',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-go',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-go',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-go',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-go',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-go',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-go',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'Elixir',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-elixir',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-elixir',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-elixir',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-elixir',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-elixir',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-elixir',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'Objective-C',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-objectivec',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-objectivec',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-objectivec',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-objectivec',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-objectivec',
                    label: 'Topics',
                },
            ]
        },
        {
            type: 'category',
            label: 'Swift',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-swift',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-swift',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-swift',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-swift',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-swift',
                    label: 'Topics',
                },
            ]
        },
        {
            type: 'category',
            label: 'Spring AMQP',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-spring-amqp',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-spring-amqp',
                    label: 'Work Queues',
                },
                {
                    type: 'doc',
                    id: 'tutorial-three-spring-amqp',
                    label: 'Publish/Subscribe',
                },
                {
                    type: 'doc',
                    id: 'tutorial-four-spring-amqp',
                    label: 'Routing',
                },
                {
                    type: 'doc',
                    id: 'tutorial-five-spring-amqp',
                    label: 'Topics',
                },
                {
                    type: 'doc',
                    id: 'tutorial-six-spring-amqp',
                    label: 'RPC',
                },
            ]
        },
        {
            type: 'category',
            label: 'Java Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-java-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-java-stream',
                    label: 'Offset Tracking',
                }
            ]
        },
        {
            type: 'category',
            label: '.NET Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-dotnet-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-dotnet-stream',
                    label: 'Offset Tracking',
                }
            ]
        },
        {
            type: 'category',
            label: 'Go Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-go-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-go-stream',
                    label: 'Offset Tracking',
                }

            ]
        },
        {
            type: 'category',
            label: 'Rust Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-rust-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-rust-stream',
                    label: 'Offset Tracking',
                },

            ]
        },
        {
            type: 'category',
            label: 'Python Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-python-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-python-stream',
                    label: 'Offset Tracking',
                }

            ]
        },
        {
            type: 'category',
            label: 'Node.js Stream',
            items: [
                {
                    type: 'doc',
                    id: 'tutorial-one-javascript-stream',
                    label: 'Hello World',
                },
                {
                    type: 'doc',
                    id: 'tutorial-two-javascript-stream',
                    label: 'Offset Tracking',
                }
            ]
        },
    ],
};

export default sidebars;
