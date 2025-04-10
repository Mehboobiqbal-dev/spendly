{ pkgs }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.tailwindcss
  ];

  idx.extensions = [
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "ms-vscode.vscode-typescript-next"
    "formulahendry.auto-rename-tag"
    "formulahendry.auto-close-tag"
  ];

  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
