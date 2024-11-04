import "@mdxeditor/editor/style.css";
import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeAdmonitionType,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  DirectiveNode,
  EditorInFocus,
  InsertAdmonition,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash-es";

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  type AdmonitionKind = "note" | "tip" | "danger" | "info" | "caution";

  if (!node || node.getType() !== "directive") {
    return false;
  }

  return ["note", "tip", "danger", "info", "caution"].includes(
    (node as DirectiveNode).getMdastNode().name as AdmonitionKind
  );
}

interface EditorProps {
  date: Date;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

const Toolbar: React.FC = () => {
  return (
    <DiffSourceToggleWrapper>
      <ConditionalContents
        options={[
          {
            when: (editor) => editor?.editorType === "codeblock",
            contents: () => <ChangeCodeMirrorLanguage />,
          },
          {
            fallback: () => (
              <>
                <ConditionalContents
                  options={[
                    {
                      when: whenInAdmonition,
                      contents: () => <ChangeAdmonitionType />,
                    },
                    { fallback: () => <BlockTypeSelect /> },
                  ]}
                />

                <Separator />

                <UndoRedo />

                <Separator />

                <BoldItalicUnderlineToggles />
                <CodeToggle />

                <Separator />

                <StrikeThroughSupSubToggles />

                <Separator />

                <ListsToggle />

                <Separator />

                <CreateLink />
                <InsertImage />

                <Separator />

                <InsertTable />
                <InsertThematicBreak />

                <Separator />

                <InsertCodeBlock />

                <ConditionalContents
                  options={[
                    {
                      when: (editorInFocus) => !whenInAdmonition(editorInFocus),
                      contents: () => (
                        <>
                          <Separator />
                          <InsertAdmonition />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
    </DiffSourceToggleWrapper>
  );
};

async function imageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  // send the file to your server and return
  // the URL of the uploaded image in the response
  const response = await fetch("/uploads/new", {
    method: "POST",
    body: formData,
  });
  const json = (await response.json()) as { url: string };
  return json.url;
}

const Editor: React.FC<EditorProps> = ({
  date,
  content,
  onContentChange,
  onSave,
}) => {
  const [localContent, setLocalcontent] = useState(content);

  const debouncedSetContent = debounce((markdown: string) => {
    setLocalcontent(markdown);
    onContentChange(markdown);
  }, 1000);

  const handleContentChange = (markdown: string) => {
    console.log("markdown:", markdown);
    debouncedSetContent(markdown);
  };

  const debouncedSave = debounce(() => {
    onSave();
    console.log("saved");
  }, 1000);

  useEffect(() => {
    console.log("content:", content);
    setLocalcontent(content);
    debouncedSave();
    return () => {
      debouncedSave.cancel();
    };
  }, [content]);

  return (
    <>
      <MDXEditor
        key={date}
        markdown={localContent}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => <Toolbar />,
          }),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "sh" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              c: "c",
              css: "CSS",
              go: "go",
              java: "java",
              js: "JavaScript",
              rust: "rust",
              sh: "bash",
              txt: "text",
            },
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin({
            diffMarkdown: "An older version",
            viewMode: "rich-text",
          }),
          imagePlugin({ imageUploadHandler }),
          tablePlugin(),
          directivesPlugin({
            directiveDescriptors: [AdmonitionDirectiveDescriptor],
          }),
        ]}
        onChange={handleContentChange}
      />
    </>
  );
};

export default Editor;
