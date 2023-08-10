<div style="display: grid; grid-template-columns: auto auto; place-items: center; width: 100%">
<h1 align="center"><img align="center" src="fliessheck.png?raw=true" width="256" height="256" alt="GlosSI Logo" />
 Fliessheck</h1>
</div>

Opinionated node.js backend framework.  
Built on top of [Express](https://expressjs.com/) and [Socket.io](https://socket.io/)

## Usage

main.ts:

```typescript
import express from "express";
import cors from "cors";
import { Logger, initServices } from "fliessheck";
import * as http from 'http';
import { HelloService } from "./HelloService";

const main = async () => {
    const port = 3000 as const;
    const expressApp = express();
    const httpServer = http.createServer(expressApp);
    expressApp.use(cors({
        origin: '*'
    }));
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(express.json());

    initServices([HelloService], expressApp, undefined)

    httpServer.listen(port, () => {
        Logger.Info('HTTPserver', `Server listening on port ${port}`);
    });
    return httpServer;
};

main().catch((e) => {
    Logger.Fatal('Main', 'Failed to start server', e);
});
```

HelloService.ts:

```typescript

class HelloHttpAdapter extends HttpAdapter<HelloController, string> {
    public override async find(query: QueryParams, headers: HeaderAccessor): Promise<string> {
        return this.controller.hello();
    }
}

class HelloController extends Controller {
    public hello(): string {
        return 'Hello World!';
    }
}


export const HelloService: ServiceConfig<HelloController> = {
    controller: HelloController,
    httpAdapter: {
        path: 'hello',
        adapter: HelloHttpAdapter
    }
};
```

### Development / Build

```bash
pnpm run build
#or for a live build with hotreload
pnpm run dev
```

## License

```license
Copyright 2017-2023 Peter Repukat - FlatspotSoftware

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
