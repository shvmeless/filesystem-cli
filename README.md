# FileSystem CLI

A set of commands to work more easily with the filesystem in the terminal.

## Installation

```bash
npm install -g @shvmerc/filesystem-cli
```

## sfsempty

Search for empty directories in a directory and allow to delete them.

### Usage

```bash
sfsempty -d /path/to/directory
```

### Options

| Option                  | Description                                            | Default                   |
| ----------------------- | ------------------------------------------------------ | ------------------------- |
| `-d, --directory <dir>` | Path of the directory from where to start the search.  | Current working directory |
| `--exclude [dirs...]`   | Directories to exclude from the search.                | Empty                     |
