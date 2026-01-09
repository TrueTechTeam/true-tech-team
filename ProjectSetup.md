# True Tech Team

A nx monorepo for multiple projects and library. Main app project will be the main portal to access everything. There will be a folder of libraries publishable as a npm package. This library will contain components, hook, contexts, decorators, and any other react code that will help developers create react apps. This app will have both web and mobil components

## React Component Library

This is a component library for react projects. It will be built with customizability and developer useability in mind. It will use storybook for documentation of the components props and customizations.

### Global Provider

There will be a global provider component that accepts configurations for the whole component library like custom theme options and component settings. This component contains any app wide context provider. The intended use of this component is to have the full app within the component to allow all parts of the app to have access to any contexts defined within the library

### Theme

This library will have a global theme that all components will use. There will be a way to export the current theme variables for the app using the library to use. The theme will use the \_colors.scss css variables as well as any other scss variables needed for this project. There will be a theme structure defined and any or all parts of it can be overridden through the global provider. There will be a fully defined dark and light theme that the parent application can use and switch between. All components will use the theme variables whenever possible. All spacing within the app will work off a 4px grid

### Decorators

There will be component decorators that provide common tools and setup for different common component styles. One being a component decorator. The component decorator will take in the type of props root styles and a component name. It will also take a className data-testId and any other common or accessible props that are useful for a root of a component. It will apply the styles and top level props to a base div element and pass everything else to the component it is decorating.

### Component Styling

Components will define css variables within the styles of the component decorator div elements style. These variables are for customizing various elements within the component. A variable will be added for any style that may be customized by the parent application. The styling method will be simple and easy to use and update.

### Global Classes

There will be globally defined classes for common styling patters. Each of the theme variables will have a class. There will be classes for all the combinations of margin and padding for up to 5 grid units. There will be classes for flex display configuarations (start, end, center, column, and simple flex box)

### Storybook

This library will use and configure storybook. Storybook will be themed for the true-tech-team brand. It will provide detailed documentation for every file that is exported (components, hooks, contexts). If there is nothing to demo it will still provide a detaild explination on how to use it and a code example. Each component will have multiple stories, one for each feature of the component. If there are multiple variants like color or size, provide an example of each with proper labels for each within the same story (size story has small med and large)

### Icons

This library will define its own svg icons. Each icon will be saved in a folder and used within an Icon component that will have configurations for size color and other customizations. All icons will have a cohesive appearence.

### Testing

All files will have unit tests that test all configurations as well as any edge cases that might exist

### Documentation

Each file will have documentation visible in storybook on its porpouse and how to use it. Each prop or input will have a description, default value, and type documented. All available css variables for a component will also exist in the documentation.

### Checklist

- Setup the project and the initial folder structure
- Generate claude guidance files and any claude tools, agents, skills, or other things to help with the creation and maintnence of the library
- setup and configure storybook
- Create the theme structure and the definitions for the dark and light theme
- Add theme and branding to storybook config
- Global provider with theme config
- Create button component
