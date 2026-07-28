import { LinkComponent } from "@/components/LinkComponent";
import { Tag } from "@/lib/types";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

type Props = {
    tag: Tag;
}

export default function TagCard({ tag }: Props) {
    return (
        <Card as={LinkComponent} href={`/questions?tag=${tag.slug}`} isHoverable isPressable>
            <CardHeader>
                <Chip variant="bordered">
                    {tag.slug}
                </Chip>
            </CardHeader>
            <CardBody>
                <p className="line-clamp-3">{tag.description}</p>
            </CardBody>
            <CardFooter>
                42 questions
            </CardFooter>
        </Card>
    );
}
